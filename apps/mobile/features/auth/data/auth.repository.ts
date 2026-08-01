import type { HttpClient } from '@/lib/api/http-client';
import {
  ApiError,
  type AuthenticatedUser,
  type AuthTokens,
  type UpdateProfileInput,
} from '@/lib/api/types';
import type { PhoneAuthGateway } from './phone-auth.gateway';
import type { TokenStorage } from './token-storage.types';
import type { PhoneVerificationSession, StoredSession } from '../domain/types';

export type AuthRepository = {
  sendOtp(phoneE164: string): Promise<PhoneVerificationSession>;
  verifyOtpAndLogin(session: PhoneVerificationSession, code: string): Promise<StoredSession>;
  restoreSession(): Promise<StoredSession | null>;
  refreshSession(): Promise<StoredSession | null>;
  fetchMe(): Promise<AuthenticatedUser>;
  logout(): Promise<void>;
  completeProfileSetup(input: UpdateProfileInput): Promise<StoredSession>;
  getSession(): Promise<StoredSession | null>;
};

function isProfileCompleteFromUser(user: AuthenticatedUser): boolean {
  if (user.identityStatus === 'authenticated') return true;
  if (user.identityStatus === 'needs_profile') return false;
  return Boolean(
    user.displayName && user.displayName.trim().length >= 2 && user.cityId,
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

export function createApiAuthRepository(deps: {
  http: HttpClient;
  storage: TokenStorage;
  phoneAuth: PhoneAuthGateway;
}): AuthRepository {
  const { http, storage, phoneAuth } = deps;

  return {
    async sendOtp(phoneE164) {
      return phoneAuth.sendOtp(phoneE164);
    },

    async verifyOtpAndLogin(session, code) {
      const { idToken } = await phoneAuth.confirmOtp(session, code);
      const tokens = await http.post<AuthTokens>('/v1/auth/login', { idToken }, false);
      const stored = toStoredSession(tokens);
      await storage.save(stored);
      return stored;
    },

    async restoreSession() {
      const existing = await storage.load();
      if (!existing?.refreshToken) return null;

      const skewMs = 30_000;
      if (existing.accessExpiresAt - skewMs > Date.now()) {
        try {
          const user = await http.get<AuthenticatedUser>('/v1/auth/me');
          const next = withUpdatedUser(existing, user);
          await storage.save(next);
          return next;
        } catch {
          // fall through to refresh
        }
      }

      return this.refreshSession();
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
      } catch (e) {
        const status = e instanceof ApiError ? e.statusCode : 0;
        const offline = e instanceof ApiError ? e.offline : false;
        if (offline || status === 0) {
          return existing;
        }
        await storage.clear();
        return null;
      }
    },

    async fetchMe() {
      return http.get<AuthenticatedUser>('/v1/auth/me');
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
        // Best-effort logout — always clear local session
      }
      await storage.clear();
    },

    async completeProfileSetup(input) {
      const existing = await storage.load();
      if (!existing) {
        throw new Error('No active session');
      }
      if (input.displayName) {
        await phoneAuth.updateDisplayName?.(input.displayName);
      }
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

/**
 * Dev OTP UX → Nest JWT via POST /v1/auth/dev-login.
 * Requires a reachable API. Offline synthetic tokens are not supported.
 */
export function createDevAuthRepository(deps: {
  http: HttpClient;
  storage: TokenStorage;
  phoneAuth: PhoneAuthGateway;
}): AuthRepository {
  const { http, storage, phoneAuth } = deps;

  async function clearLegacyOfflineSession(
    existing: StoredSession | null,
  ): Promise<StoredSession | null> {
    if (!existing) return null;
    if (existing.accessToken.startsWith('mock-access-')) {
      await storage.clear();
      return null;
    }
    return existing;
  }

  return {
    async sendOtp(phoneE164) {
      return phoneAuth.sendOtp(phoneE164);
    },

    async verifyOtpAndLogin(session, code) {
      await phoneAuth.confirmOtp(session, code);
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
      const existing = await clearLegacyOfflineSession(await storage.load());
      if (!existing?.refreshToken) return null;

      const skewMs = 30_000;
      if (existing.accessExpiresAt - skewMs > Date.now()) {
        try {
          const user = await http.get<AuthenticatedUser>('/v1/auth/me');
          const next = withUpdatedUser(existing, user);
          await storage.save(next);
          return next;
        } catch {
          // fall through to refresh
        }
      }

      return this.refreshSession();
    },

    async refreshSession() {
      const existing = await clearLegacyOfflineSession(await storage.load());
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
      } catch (e) {
        const status = e instanceof ApiError ? e.statusCode : 0;
        const offline = e instanceof ApiError ? e.offline : false;
        if (offline || status === 0) {
          return existing;
        }
        await storage.clear();
        return null;
      }
    },

    async fetchMe() {
      return http.get<AuthenticatedUser>('/v1/auth/me');
    },

    async logout() {
      const existing = await clearLegacyOfflineSession(await storage.load());
      try {
        if (existing?.accessToken) {
          await http.post(
            '/v1/auth/logout',
            { refreshToken: existing.refreshToken, revokeAll: false },
            true,
          );
        }
      } catch {
        // Best-effort logout — always clear local session
      }
      await storage.clear();
    },

    async completeProfileSetup(input) {
      const existing = await storage.load();
      if (!existing) throw new Error('No active session');
      if (input.displayName) {
        await phoneAuth.updateDisplayName?.(input.displayName);
      }
      const user = await http.patch<AuthenticatedUser>('/v1/auth/me', input, true);
      const next = withUpdatedUser(existing, user);
      await storage.save(next);
      return next;
    },

    async getSession() {
      return clearLegacyOfflineSession(await storage.load());
    },
  };
}

/** @deprecated Use createDevAuthRepository */
export const createMockAuthRepository = createDevAuthRepository;
