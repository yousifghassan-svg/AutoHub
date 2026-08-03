import AsyncStorage from '@react-native-async-storage/async-storage';
import { newListingDraftLocalId } from '@autohub/utils';

/**
 * Generic multi-draft JSON list store (mobile port of the Listing Draft Engine).
 * Domain plugins supply T; this module never reads vehicle/plate fields.
 */
export type ListingDraftListItem = {
  localId: string;
  updatedAt: string;
  /** Optional monotonic revision for future conflict detection. */
  revision?: number;
};

export function createJsonDraftStore<T extends ListingDraftListItem>(
  storageKey: string,
  options?: { maxItems?: number },
) {
  const maxItems = options?.maxItems ?? 40;

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
    await AsyncStorage.setItem(storageKey, JSON.stringify(items.slice(0, maxItems)));
  }

  async function remove(localId: string): Promise<void> {
    const items = (await list()).filter((x) => x.localId !== localId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(items));
  }

  return { list, get, save, remove };
}

/** Shared local id generator (same algorithm as web Draft Engine). */
export { newListingDraftLocalId };
