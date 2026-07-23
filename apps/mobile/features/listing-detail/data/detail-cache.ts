import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ListingDetailModel } from '../domain/types';

const PREFIX = 'autohub.listing.detail.';

export type DetailCache = {
  get(id: string): Promise<ListingDetailModel | null>;
  set(detail: ListingDetailModel): Promise<void>;
  remove(id: string): Promise<void>;
};

export function createDetailCache(): DetailCache {
  return {
    async get(id) {
      const raw = await AsyncStorage.getItem(PREFIX + id);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as ListingDetailModel;
      } catch {
        return null;
      }
    },
    async set(detail) {
      await AsyncStorage.setItem(PREFIX + detail.id, JSON.stringify(detail));
    },
    async remove(id) {
      await AsyncStorage.removeItem(PREFIX + id);
    },
  };
}

export function createMemoryDetailCache(
  initial: Record<string, ListingDetailModel> = {},
): DetailCache {
  const map = new Map(Object.entries(initial));
  return {
    async get(id) {
      return map.get(id) ?? null;
    },
    async set(detail) {
      map.set(detail.id, detail);
    },
    async remove(id) {
      map.delete(id);
    },
  };
}
