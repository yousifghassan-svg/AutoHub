import type { HttpClient } from '@/lib/api/http-client';
import { mapListingToCard } from '../domain/mappers';
import type {
  ListingsPage,
  ListingsQuery,
  RecentSearchItem,
  TrendingData,
  ListingCardModel,
  CategoryItem,
} from '../domain/types';
import {
  MOCK_CATEGORIES,
  MOCK_LISTINGS,
  MOCK_RECENT_SEARCHES,
  MOCK_TRENDING,
  paginateMock,
} from './mock-home-data';
import type { RecentlyViewedStore } from './recently-viewed.storage';

export type HomeRepository = {
  getListings(query: ListingsQuery): Promise<ListingsPage>;
  getFeatured(pageSize?: number): Promise<ListingCardModel[]>;
  getLatest(page: number, pageSize?: number): Promise<ListingsPage>;
  getTrending(days?: number, limit?: number): Promise<TrendingData>;
  getRecentSearches(limit?: number): Promise<RecentSearchItem[]>;
  getCategories(): Promise<CategoryItem[]>;
  getRecentlyViewed(): Promise<ListingCardModel[]>;
  recordView(listing: ListingCardModel): Promise<void>;
};

type ListingsApiData = {
  items: Parameters<typeof mapListingToCard>[0][];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function toQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export function createApiHomeRepository(deps: {
  http: HttpClient;
  recentlyViewed: RecentlyViewedStore;
  locale?: 'ar' | 'ku' | 'en';
}): HomeRepository {
  const { http, recentlyViewed } = deps;
  const locale = deps.locale ?? 'ar';

  return {
    async getListings(query) {
      const data = await http.get<ListingsApiData>(
        `/v1/listings${toQueryString({
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
          isFeatured: query.isFeatured,
          categoryCode: query.categoryCode,
          keyword: query.keyword,
          sortBy: query.sortBy ?? 'createdAt',
          sortOrder: query.sortOrder ?? 'desc',
        })}`,
        false,
      );
      return {
        ...data,
        items: data.items.map((item) => mapListingToCard(item, locale)),
      };
    },

    async getFeatured(pageSize = 10) {
      const page = await this.getListings({ page: 1, pageSize, isFeatured: true });
      return page.items;
    },

    async getLatest(page, pageSize = 10) {
      return this.getListings({
        page,
        pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    },

    async getTrending(days = 7, limit = 10) {
      return http.get<TrendingData>(
        `/v1/search/trending${toQueryString({ days, limit })}`,
        false,
      );
    },

    async getRecentSearches(limit = 20) {
      try {
        return await http.get<RecentSearchItem[]>(
          `/v1/search/recent${toQueryString({ limit })}`,
          true,
        );
      } catch {
        return [];
      }
    },

    async getCategories() {
      try {
        const trending = await this.getTrending(7, 10);
        if (trending.categories.length) return trending.categories;
      } catch {
        // fall through
      }
      return MOCK_CATEGORIES;
    },

    getRecentlyViewed: () => recentlyViewed.list(),
    recordView: (listing) => recentlyViewed.push(listing),
  };
}

export function createMockHomeRepository(deps: {
  recentlyViewed: RecentlyViewedStore;
}): HomeRepository {
  const { recentlyViewed } = deps;

  return {
    async getListings(query) {
      let items = [...MOCK_LISTINGS];
      if (query.isFeatured) items = items.filter((x) => x.isFeatured);
      if (query.categoryCode) {
        items = items.filter((x) => x.categoryCode === query.categoryCode);
      }
      if (query.keyword) {
        const q = query.keyword.toLowerCase();
        items = items.filter((x) => x.title.toLowerCase().includes(q));
      }
      return paginateMock(items, query.page ?? 1, query.pageSize ?? 20);
    },
    async getFeatured(pageSize = 10) {
      return MOCK_LISTINGS.filter((x) => x.isFeatured).slice(0, pageSize);
    },
    async getLatest(page, pageSize = 10) {
      return paginateMock(MOCK_LISTINGS, page, pageSize);
    },
    async getTrending() {
      return MOCK_TRENDING;
    },
    async getRecentSearches() {
      return MOCK_RECENT_SEARCHES;
    },
    async getCategories() {
      return MOCK_CATEGORIES;
    },
    getRecentlyViewed: () => recentlyViewed.list(),
    recordView: (listing) => recentlyViewed.push(listing),
  };
}
