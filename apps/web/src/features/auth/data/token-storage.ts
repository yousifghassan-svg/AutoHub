import type { StoredSession } from '../domain/types';

const KEY = 'autohub.web.session';

export type TokenStorage = {
  load(): Promise<StoredSession | null>;
  save(session: StoredSession): Promise<void>;
  clear(): Promise<void>;
};

export function createBrowserTokenStorage(): TokenStorage {
  return {
    async load() {
      if (typeof window === 'undefined') return null;
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        return JSON.parse(raw) as StoredSession;
      } catch {
        return null;
      }
    },
    async save(session) {
      localStorage.setItem(KEY, JSON.stringify(session));
    },
    async clear() {
      localStorage.removeItem(KEY);
    },
  };
}
