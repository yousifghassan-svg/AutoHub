import type { StoredSession } from '../domain/types';

export type TokenStorage = {
  load(): Promise<StoredSession | null>;
  save(session: StoredSession): Promise<void>;
  clear(): Promise<void>;
};
