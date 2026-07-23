import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ManagedListing, StatusTab } from '../domain/types';

const KEY = 'autohub.myListings.cache';

type CacheBlob = {
  updatedAt: string;
  byTab: Partial<Record<StatusTab, ManagedListing[]>>;
};

export type MyListingsCache = {
  get(tab: StatusTab): Promise<ManagedListing[] | null>;
  set(tab: StatusTab, items: ManagedListing[]): Promise<void>;
  clear(): Promise<void>;
};

async function read(): Promise<CacheBlob> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { updatedAt: '', byTab: {} };
  try {
    return JSON.parse(raw) as CacheBlob;
  } catch {
    return { updatedAt: '', byTab: {} };
  }
}

export function createMyListingsCache(): MyListingsCache {
  return {
    async get(tab) {
      const blob = await read();
      return blob.byTab[tab] ?? null;
    },
    async set(tab, items) {
      const blob = await read();
      blob.byTab[tab] = items;
      blob.updatedAt = new Date().toISOString();
      await AsyncStorage.setItem(KEY, JSON.stringify(blob));
    },
    async clear() {
      await AsyncStorage.removeItem(KEY);
    },
  };
}

export function createMemoryMyListingsCache(
  initial: Partial<Record<StatusTab, ManagedListing[]>> = {},
): MyListingsCache {
  const byTab = { ...initial };
  return {
    async get(tab) {
      return byTab[tab] ?? null;
    },
    async set(tab, items) {
      byTab[tab] = items;
    },
    async clear() {
      for (const k of Object.keys(byTab)) delete byTab[k as StatusTab];
    },
  };
}
