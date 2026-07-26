import AsyncStorage from '@react-native-async-storage/async-storage';

export function createJsonDraftStore<T extends { localId: string; updatedAt: string }>(
  storageKey: string,
) {
  async function list(): Promise<T[]> {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as T[];
      return parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [];
    }
  }

  async function get(localId: string): Promise<T | null> {
    const items = await list();
    return items.find((x) => x.localId === localId) ?? null;
  }

  async function save(draft: T): Promise<void> {
    const items = await list();
    const idx = items.findIndex((x) => x.localId === draft.localId);
    if (idx >= 0) items[idx] = draft;
    else items.unshift(draft);
    await AsyncStorage.setItem(storageKey, JSON.stringify(items.slice(0, 40)));
  }

  async function remove(localId: string): Promise<void> {
    const items = (await list()).filter((x) => x.localId !== localId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(items));
  }

  return { list, get, save, remove };
}
