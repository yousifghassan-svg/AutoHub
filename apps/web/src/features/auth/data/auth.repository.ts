import type { HttpClient } from '@/lib/api/http-client';
import type { AuthenticatedUser, AuthTokens } from '@/lib/api/types';
import { config } from '@/lib/config';
import type { PhoneVerificationSession, StoredSession } from '../domain/types';
import type { TokenStorage } from './token-storage';

export type AuthRepository = {
  sendOtp(phoneE164: string): Promise<PhoneVerificationSession>;
  verifyOtpAndLogin(session: PhoneVerificationSession, code: string): Promise<StoredSession>;
  restoreSession(): Promise<StoredSession | null>;
  refreshSession(): Promise<StoredSession | null>;
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

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  return `+964${digits}`;
}

export function createMockAuthRepository(storage: TokenStorage): AuthRepository {
  function mockUser(phone: string, displayName: string | null): AuthenticatedUser {
    return {
      id: `mock-user-${phone.replace(/\D/g, '')}`,
      firebaseUid: `mock-firebase-${phone}`,
      phone,
      email: null,
      displayName,
      role: 'USER',
      permissions: [
        'profile:read',
        'profile:write',
        'listings:read',
        'listings:write',
        'listings:create',
        'listings:delete',
        'media:upload',
        'media:read',
      ],
      status: 'ACTIVE',
    };
  }

  return {
    async sendOtp(phoneE164) {
      return {
        phoneE164: normalizePhone(phoneE164),
        verificationId: `mock-verif-${Date.now()}`,
      };
    },
    async verifyOtpAndLogin(session, code) {
      if (code.trim() !== config.mockOtpCode) {
        throw new Error(`Invalid OTP. Use ${config.mockOtpCode} in mock mode.`);
      }
      const user = mockUser(session.phoneE164, null);
      const stored: StoredSession = {
        accessToken: `mock-access-${user.id}`,
        refreshToken: `mock-refresh-${user.id}`,
        accessExpiresAt: Date.now() + 15 * 60 * 1000,
        user,
        profileSetupComplete: false,
      };
      await storage.save(stored);
      return stored;
    },
    async restoreSession() {
      return storage.load();
    },
    async refreshSession() {
      const existing = await storage.load();
      if (!existing) return null;
      const next = {
        ...existing,
        accessToken: `mock-access-${existing.user.id}-${Date.now()}`,
        refreshToken: `mock-refresh-${existing.user.id}-${Date.now()}`,
        accessExpiresAt: Date.now() + 15 * 60 * 1000,
      };
      await storage.save(next);
      return next;
    },
    async logout() {
      await storage.clear();
    },
    async completeProfileSetup(displayName) {
      const existing = await storage.load();
      if (!existing) throw new Error('No active session');
      const next = {
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

/** API mode expects a Firebase idToken from the caller (web Firebase wiring). */
export function createApiAuthRepository(deps: {
  http: HttpClient;
  storage: TokenStorage;
  getIdToken: (session: PhoneVerificationSession, code: string) => Promise<string>;
}): AuthRepository {
  const { http, storage, getIdToken } = deps;
  return {
    async sendOtp(phoneE164) {
      // Firebase phone start is handled by getIdToken provider; placeholder session.
      return {
        phoneE164: normalizePhone(phoneE164),
        verificationId: `api-pending-${Date.now()}`,
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
        const stored = toStoredSession(tokens, existing.profileSetupComplete);
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
          const next = { ...existing, user };
          await storage.save(next);
          return next;
        } catch {
          /* fall through to refresh */
        }
      }
      const tokens = existing.refreshToken
        ? await http
            .post<AuthTokens>('/v1/auth/refresh', { refreshToken: existing.refreshToken }, false)
            .then((t) => toStoredSession(t, existing.profileSetupComplete))
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
      await storage.clear();
    },
    async completeProfileSetup(displayName) {
      const existing = await storage.load();
      if (!existing) throw new Error('No active session');
      const next = {
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
