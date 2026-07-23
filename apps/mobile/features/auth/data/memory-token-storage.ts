import type { StoredSession } from '../domain/types';
import type { TokenStorage } from './token-storage.types';

/** In-memory storage for unit tests. */
export function createMemoryTokenStorage(initial?: StoredSession | null): TokenStorage {
  let session: StoredSession | null = initial ?? null;
  return {
    async load() {
      return session;
    },
    async save(next) {
      session = next;
    },
    async clear() {
      session = null;
    },
  };
}
