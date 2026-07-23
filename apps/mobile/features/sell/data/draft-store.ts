import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WizardDraft } from '../domain/types';

const KEY = 'autohub.sell.drafts';

export type DraftStore = {
  list(): Promise<WizardDraft[]>;
  get(localId: string): Promise<WizardDraft | null>;
  save(draft: WizardDraft): Promise<void>;
  remove(localId: string): Promise<void>;
};

export function createDraftStore(): DraftStore {
  return {
    async list() {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return [];
      try {
        const list = JSON.parse(raw) as WizardDraft[];
        return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      } catch {
        return [];
      }
    },
    async get(localId) {
      const list = await this.list();
      return list.find((d) => d.localId === localId) ?? null;
    },
    async save(draft) {
      const list = await this.list();
      const next = [draft, ...list.filter((d) => d.localId !== draft.localId)];
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    },
    async remove(localId) {
      const list = await this.list();
      await AsyncStorage.setItem(
        KEY,
        JSON.stringify(list.filter((d) => d.localId !== localId)),
      );
    },
  };
}

export function createMemoryDraftStore(initial: WizardDraft[] = []): DraftStore {
  let list = [...initial];
  return {
    async list() {
      return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async get(localId) {
      return list.find((d) => d.localId === localId) ?? null;
    },
    async save(draft) {
      list = [draft, ...list.filter((d) => d.localId !== draft.localId)];
    },
    async remove(localId) {
      list = list.filter((d) => d.localId !== localId);
    },
  };
}
