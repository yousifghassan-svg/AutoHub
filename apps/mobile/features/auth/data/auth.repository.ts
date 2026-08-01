import type { HttpClient } from '@/lib/api/http-client';
import { ApiError, type AuthenticatedUser, type AuthTokens } from '@/lib/api/types';
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
  completeProfileSetup(displayName: string): Promise<StoredSession>;
  getSession(): Promise<StoredSession | null>;
};

function toStoredSession(tokens: AuthTokens, profileSetupComplete?: boolean): StoredSession {
  const complete =
    profileSetupComplete ??
    Boolean(tokens.user.displayName && tokens.user.displayName.trim().length >= 2);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessExpiresAt: Date.now() + tokens.expiresIn * 1000,
    user: tokens.user,
    profileSetupComplete: complete,
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
          const next = { ...existing, user };
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
        const stored = toStoredSession(tokens, existing.profileSetupComplete);
        await storage.save(stored);
        return stored;
      } catch (e) {
        // Keep local session on offline/network blips; only clear on auth rejection.
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

    async completeProfileSetup(displayName) {
      const existing = await storage.load();
      if (!existing) {
        throw new Error('No active session');
      }
      await phoneAuth.updateDisplayName?.(displayName);
      const next: StoredSession = {
        ...existing,
        user: { ...existing.user, displayName },
        profileSetupComplete: true,
      };
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
          const next = { ...existing, user };
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
        const stored = toStoredSession(tokens, existing.profileSetupComplete);
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

    async completeProfileSetup(displayName) {
      const existing = await storage.load();
      if (!existing) throw new Error('No active session');
      await phoneAuth.updateDisplayName?.(displayName);
      const next = {
        ...existing,
        user: { ...existing.user, displayName },
        profileSetupComplete: true,
      };
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
