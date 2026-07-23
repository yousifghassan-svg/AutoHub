import { createHttpClient, type HttpClient } from './http-client';
import { config } from '../config';
import { isOnline } from '../network';
import { emitAuthFailure } from '../auth-events';
import { createSecureTokenStorage } from '@/features/auth/data/token-storage';

let http: HttpClient | null = null;

/** Shared authenticated HTTP client (refresh-aware). */
export function getHttpClient(): HttpClient {
  if (http) return http;

  const storage = createSecureTokenStorage();
  http = createHttpClient({
    baseUrl: config.apiUrl,
    getTokens: async () => {
      const session = await storage.load();
      if (!session) return null;
      return { accessToken: session.accessToken, refreshToken: session.refreshToken };
    },
    onTokensRefreshed: async (tokens) => {
      const session = await storage.load();
      if (!session) return;
      await storage.save({
        ...session,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessExpiresAt: Date.now() + tokens.expiresIn * 1000,
      });
    },
    onAuthFailure: async () => {
      await storage.clear();
      emitAuthFailure();
    },
    isOnline,
  });

  return http;
}

export function __setHttpClientForTests(next: HttpClient | null) {
  http = next;
}
