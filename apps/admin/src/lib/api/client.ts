import { createHttpClient, type HttpClient } from './http-client';
import { config } from '../config';
import { createBrowserTokenStorage } from '@/features/auth/data/token-storage';

let http: HttpClient | null = null;
const storage = createBrowserTokenStorage();

export function getHttpClient(): HttpClient {
  if (http) return http;
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('autohub:auth-failure'));
      }
    },
  });
  return http;
}

export function getTokenStorage() {
  return storage;
}
