import type { HttpClient } from '@/lib/api/http-client';
import type {
  AuthenticatedUser,
  AuthTokens,
  UpdateProfileInput,
} from '@/lib/api/types';
import { config } from '@/lib/config';
import type { PhoneVerificationSession, StoredSession } from '../domain/types';
import {
  clearPhoneConfirmations,
  confirmOtp as confirmFirebaseOtp,
  sendOtp as sendFirebaseOtp,
} from '@/lib/firebase';
import type { TokenStorage } from './token-storage';

export type AuthRepository = {
  sendOtp(phoneE164: string): Promise<PhoneVerificationSession>;
  verifyOtpAndLogin(session: PhoneVerificationSession, code: string): Promise<StoredSession>;
  restoreSession(): Promise<StoredSession | null>;
  refreshSession(): Promise<StoredSession | null>;
  logout(): Promise<void>;
  completeProfileSetup(input: UpdateProfileInput): Promise<StoredSession>;
  getSession(): Promise<StoredSession | null>;
};

function isProfileCompleteFromUser(user: AuthenticatedUser): boolean {
  if (user.identityStatus === 'authenticated') return true;
  if (user.identityStatus === 'needs_profile') return false;
  return Boolean(
    user.displayName &&
      user.displayName.trim().length >= 2 &&
      user.cityId,
  );
}

function toStoredSession(tokens: AuthTokens): StoredSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessExpiresAt: Date.now() + tokens.expiresIn * 1000,
    user: tokens.user,
    profileSetupComplete: isProfileCompleteFromUser(tokens.user),
  };
}

function withUpdatedUser(
  existing: StoredSession,
  user: AuthenticatedUser,
): StoredSession {
  return {
    ...existing,
    user,
    profileSetupComplete: isProfileCompleteFromUser(user),
  };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  return `+964${digits}`;
}

function rejectLegacyOfflineSession(existing: StoredSession | null): StoredSession | null {
  if (!existing) return null;
  if (existing.accessToken.startsWith('mock-access-')) {
    return null;
  }
  return existing;
}

/**
 * Dev OTP UX → real Nest JWT via POST /v1/auth/dev-login.
 * Requires a reachable API. Offline / synthetic tokens are not supported.
 */
export function createDevAuthRepository(
  storage: TokenStorage,
  http: HttpClient,
): AuthRepository {
  return {
    async sendOtp(phoneE164) {
      return {
        phoneE164: normalizePhone(phoneE164),
        verificationId: `dev-verif-${Date.now()}`,
      };
    },
    async verifyOtpAndLogin(session, code) {
      if (code.trim() !== config.authDevOtp) {
        throw new Error(`Invalid OTP. Use ${config.authDevOtp} in dev auth mode.`);
      }
      const tokens = await http.post<AuthTokens>(
        '/v1/auth/dev-login',
        { phone: session.phoneE164 },
        false,
      );
      const stored = toStoredSession(tokens);
      await storage.save(stored);
      return stored;
    },
    async restoreSession() {
      const existing = rejectLegacyOfflineSession(await storage.load());
      if (!existing) {
        await storage.clear();
        return null;
      }
      if (existing.accessExpiresAt - 30_000 > Date.now()) {
        try {
          const user = await http.get<AuthenticatedUser>('/v1/auth/me');
          const next = withUpdatedUser(existing, user);
          await storage.save(next);
          return next;
        } catch {
          /* refresh below */
        }
      }
      try {
        const tokens = await http.post<AuthTokens>(
          '/v1/auth/refresh',
          { refreshToken: existing.refreshToken },
          false,
        );
        const stored = toStoredSession(tokens);
        await storage.save(stored);
        return stored;
      } catch (e) {
        const status =
          e && typeof e === 'object' && 'statusCode' in e
            ? Number((e as { statusCode?: number }).statusCode)
            : 0;
        if (status === 0) return existing;
        await storage.clear();
        return null;
      }
    },
    async refreshSession() {
      const existing = rejectLegacyOfflineSession(await storage.load());
      if (!existing) {
        await storage.clear();
        return null;
      }
      try {
        const tokens = await http.post<AuthTokens>(
          '/v1/auth/refresh',
          { refreshToken: existing.refreshToken },
          false,
        );
        const stored = toStoredSession(tokens);
        await storage.save(stored);
        return stored;
      } catch (e) {
        const status =
          e && typeof e === 'object' && 'statusCode' in e
            ? Number((e as { statusCode?: number }).statusCode)
            : 0;
        if (status === 0) return existing;
        await storage.clear();
        return null;
      }
    },
    async logout() {
      const existing = rejectLegacyOfflineSession(await storage.load());
      if (existing?.accessToken) {
        try {
          await http.post(
            '/v1/auth/logout',
            { refreshToken: existing.refreshToken, revokeAll: false },
            true,
          );
        } catch {
          /* best effort */
        }
      }
      await storage.clear();
    },
    async completeProfileSetup(input) {
      const existing = await storage.load();
      if (!existing) throw new Error('No active session');
      const user = await http.patch<AuthenticatedUser>('/v1/auth/me', input, true);
      const next = withUpdatedUser(existing, user);
      await storage.save(next);
      return next;
    },
    async getSession() {
      return rejectLegacyOfflineSession(await storage.load());
    },
  };
}

/**
 * Firebase phone OTP → Nest `POST /v1/auth/login` with Firebase ID token.
 * Session restore/refresh/logout unchanged (Nest JWT + refresh).
 */
export function createFirebaseAuthRepository(
  storage: TokenStorage,
  http: HttpClient,
): AuthRepository {
  return createApiAuthRepository({
    http,
    storage,
    sendOtp: async (phoneE164) => {
      const phone = normalizePhone(phoneE164);
      return sendFirebaseOtp(phone);
    },
    getIdToken: (session, code) => confirmFirebaseOtp(session.verificationId, code),
    onLogout: () => {
      clearPhoneConfirmations();
    },
  });
}

/** Shared Nest session adapter used by Firebase (and tests). */
export function createApiAuthRepository(deps: {
  http: HttpClient;
  storage: TokenStorage;
  sendOtp?: (phoneE164: string) => Promise<PhoneVerificationSession>;
  getIdToken: (session: PhoneVerificationSession, code: string) => Promise<string>;
  onLogout?: () => void;
}): AuthRepository {
  const { http, storage, getIdToken, onLogout } = deps;
  return {
    async sendOtp(phoneE164) {
      if (deps.sendOtp) return deps.sendOtp(phoneE164);
      return {
        phoneE164: normalizePhone(phoneE164),
        verificationId: `firebase-pending-${Date.now()}`,
      };
    },
    async verifyOtpAndLogin(session, code) {
      const idToken = await getIdToken(session, code);
      const tokens = await http.post<AuthTokens>('/v1/auth/login', { idToken }, false);
      const stored = toStoredSession(tokens);
      await storage.save(stored);
      return stored;
    },
    async refreshSession() {
      const existing = await storage.load();
      if (!existing?.refreshToken) return null;
      try {
        const tokens = await http.post<AuthTokens>(
          '/v1/auth/refresh',
          { refreshToken: existing.refreshToken },
          false,
        );
        const stored = toStoredSession(tokens);
        await storage.save(stored);
        return stored;
      } catch {
        await storage.clear();
        return null;
      }
    },
    async restoreSession() {
      const existing = await storage.load();
      if (!existing?.refreshToken) return null;
      if (existing.accessExpiresAt - 30_000 > Date.now()) {
        try {
          const user = await http.get<AuthenticatedUser>('/v1/auth/me');
          const next = withUpdatedUser(existing, user);
          await storage.save(next);
          return next;
        } catch {
          /* fall through to refresh */
        }
      }
      const tokens = existing.refreshToken
        ? await http
            .post<AuthTokens>('/v1/auth/refresh', { refreshToken: existing.refreshToken }, false)
            .then((t) => toStoredSession(t))
            .catch(async () => {
              await storage.clear();
              return null;
            })
        : null;
      if (tokens) await storage.save(tokens);
      return tokens;
    },
    async logout() {
      const existing = await storage.load();
      try {
        if (existing?.accessToken) {
          await http.post(
            '/v1/auth/logout',
            { refreshToken: existing.refreshToken, revokeAll: false },
            true,
          );
        }
      } catch {
        /* best effort */
      }
      onLogout?.();
      await storage.clear();
    },
    async completeProfileSetup(input) {
      const existing = await storage.load();
      if (!existing) throw new Error('No active session');
      const user = await http.patch<AuthenticatedUser>('/v1/auth/me', input, true);
      const next = withUpdatedUser(existing, user);
      await storage.save(next);
      return next;
    },
    async getSession() {
      return storage.load();
    },
  };
}
