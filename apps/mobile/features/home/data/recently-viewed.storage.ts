import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ListingCardModel } from '../domain/types';

const KEY = 'autohub.home.recentlyViewed';
const MAX = 20;

export type RecentlyViewedStore = {
  list(): Promise<ListingCardModel[]>;
  push(listing: ListingCardModel): Promise<void>;
  clear(): Promise<void>;
};

export function createRecentlyViewedStore(): RecentlyViewedStore {
  return {
    async list() {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return [];
      try {
        return JSON.parse(raw) as ListingCardModel[];
      } catch {
        return [];
      }
    },
    async push(listing) {
      const current = await this.list();
      const next = [listing, ...current.filter((x) => x.id !== listing.id)].slice(0, MAX);
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    },
    async clear() {
      await AsyncStorage.removeItem(KEY);
    },
  };
}

export function createMemoryRecentlyViewedStore(
  initial: ListingCardModel[] = [],
): RecentlyViewedStore {
  let items = [...initial];
  return {
    async list() {
      return items;
    },
    async push(listing) {
      items = [listing, ...items.filter((x) => x.id !== listing.id)].slice(0, MAX);
    },
    async clear() {
      items = [];
    },
  };
}
