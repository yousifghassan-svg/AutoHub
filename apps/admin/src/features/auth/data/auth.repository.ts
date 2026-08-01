import type { HttpClient } from '@/lib/api/http-client';
import type { AuthenticatedUser, AuthTokens } from '@/lib/api/types';
import { config } from '@/lib/config';
import type { StoredSession } from '../domain/types';
import type { TokenStorage } from './token-storage';

export type AuthRepository = {
  staffLogin(phone: string): Promise<StoredSession>;
  restoreSession(): Promise<StoredSession | null>;
  logout(): Promise<void>;
  getSession(): Promise<StoredSession | null>;
};

function toStoredSession(tokens: AuthTokens): StoredSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessExpiresAt: Date.now() + tokens.expiresIn * 1000,
    user: tokens.user,
  };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  return `+964${digits}`;
}

export function createAuthRepository(deps: {
  http: HttpClient;
  storage: TokenStorage;
}): AuthRepository {
  const { http, storage } = deps;

  return {
    async staffLogin(phone) {
      if (config.authMode !== 'staff') {
        throw new Error(
          'Staff phone login is disabled in this build (NEXT_PUBLIC_AUTH_MODE must be staff).',
        );
      }
      const tokens = await http.post<AuthTokens>(
        '/v1/auth/staff-login',
        { phone: normalizePhone(phone) },
        false,
      );
      const stored = toStoredSession(tokens);
      await storage.save(stored);
      return stored;
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
    async getSession() {
      return storage.load();
    },
  };
}
