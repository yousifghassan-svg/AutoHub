import * as SecureStore from 'expo-secure-store';
import type { StoredSession } from '../domain/types';
import type { TokenStorage } from './token-storage.types';

export type { TokenStorage } from './token-storage.types';

const SESSION_KEY = 'autohub.auth.session';

export function createSecureTokenStorage(): TokenStorage {
  return {
    async load() {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StoredSession;
      } catch {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return null;
      }
    },
    async save(session) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    },
    async clear() {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    },
  };
}
