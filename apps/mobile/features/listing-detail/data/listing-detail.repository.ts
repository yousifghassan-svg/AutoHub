import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HttpClient } from '@/lib/api/http-client';
import { ApiError } from '@/lib/api/types';
import { mapListingDetail, mapSimilarFromListItem } from '../domain/mappers';
import type { ListingDetailModel, ListingMediaItem, SimilarListing } from '../domain/types';
import type { DetailCache } from './detail-cache';
import { mockDetailFromCard, mockSimilar } from './mock-detail-data';

const REPORTS_KEY = 'autohub.listing.reports';

export type ListingDetailRepository = {
  getById(id: string): Promise<ListingDetailModel>;
  getMedia(id: string): Promise<ListingMediaItem[]>;
  getSimilar(detail: ListingDetailModel, limit?: number): Promise<SimilarListing[]>;
  /** Local-only report placeholder (no API yet) */
  reportListing(id: string, reason: string): Promise<{ queued: true }>;
};

type ListingsPageApi = {
  items: Array<Parameters<typeof mapSimilarFromListItem>[0] & { id: string }>;
};

async function queueReport(id: string, reason: string): Promise<{ queued: true }> {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  const list: Array<{ id: string; reason: string; at: string }> = raw ? JSON.parse(raw) : [];
  list.push({ id, reason, at: new Date().toISOString() });
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list));
  return { queued: true };
}

export function createApiListingDetailRepository(deps: {
  http: HttpClient;
  cache: DetailCache;
  locale?: 'ar' | 'ku' | 'en';
}): ListingDetailRepository {
  const { http, cache } = deps;
  const locale = deps.locale ?? 'ar';

  return {
    async getById(id) {
      try {
        const raw = await http.get<Parameters<typeof mapListingDetail>[0]>(
          `/v1/listings/${id}`,
          false,
        );
        const detail = mapListingDetail(raw, locale, null);
        await cache.set(detail);
        return detail;
      } catch (error) {
        const cached = await cache.get(id);
        if (cached) return cached;
        throw error;
      }
    },

    async getMedia(id) {
      // Related media for a listing = ListingMedia on GET /v1/listings/:id
      // (MediaAsset GET /v1/media/:id is a different id space)
      const detail = await this.getById(id);
      return detail.media;
    },

    async getSimilar(detail, limit = 8) {
      const qs = new URLSearchParams({
        page: '1',
        pageSize: String(limit + 2),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (detail.similarQuery.categoryCode) {
        qs.set('categoryCode', detail.similarQuery.categoryCode);
      }
      try {
        const data = await http.get<ListingsPageApi>(`/v1/listings?${qs.toString()}`, false);
        return data.items
          .filter((x) => x.id !== detail.id)
          .slice(0, limit)
          .map((x) => mapSimilarFromListItem(x, locale));
      } catch {
        return [];
      }
    },

    reportListing: queueReport,
  };
}

export function createMockListingDetailRepository(deps: {
  cache: DetailCache;
}): ListingDetailRepository {
  const { cache } = deps;

  return {
    async getById(id) {
      const cached = await cache.get(id);
      if (cached) return cached;
      const detail = mockDetailFromCard(id);
      if (!detail) {
        throw new ApiError({ message: 'Listing not found', statusCode: 404, code: 'NOT_FOUND' });
      }
      await cache.set(detail);
      return detail;
    },
    async getMedia(id) {
      const detail = await this.getById(id);
      return detail.media;
    },
    async getSimilar(detail, limit = 8) {
      return mockSimilar(detail.id).slice(0, limit);
    },
    reportListing: queueReport,
  };
}
