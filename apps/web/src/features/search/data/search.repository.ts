import type { HttpClient } from '@/lib/api/http-client';
import type { Paginated } from '@/lib/api/types';
import {
  mapListingToCard,
  type ApiListing,
} from '@/features/listings/domain/mappers';
import type { ListingCardModel } from '@/features/listings/domain/types';
import type { MarketplaceSearchQuery } from '../domain/types';

function toQuery(params: MarketplaceSearchQuery): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.categoryCode) sp.set('categoryCode', params.categoryCode);
  if (params.brandId) sp.set('brandId', params.brandId);
  if (params.modelId) sp.set('modelId', params.modelId);
  if (params.bodyTypeId) sp.set('bodyTypeId', params.bodyTypeId);
  if (params.colorId) sp.set('colorId', params.colorId);
  if (params.governorateId) sp.set('governorateId', params.governorateId);
  if (params.cityId) sp.set('cityId', params.cityId);
  if (params.minPrice != null) sp.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) sp.set('maxPrice', String(params.maxPrice));
  if (params.minYear != null) sp.set('minYear', String(params.minYear));
  if (params.maxYear != null) sp.set('maxYear', String(params.maxYear));
  if (params.minMileage != null) sp.set('minMileage', String(params.minMileage));
  if (params.maxMileage != null) sp.set('maxMileage', String(params.maxMileage));
  if (params.fuelTypeId) sp.set('fuelTypeId', params.fuelTypeId);
  if (params.transmissionTypeId) sp.set('transmissionTypeId', params.transmissionTypeId);
  if (params.featuredOnly) sp.set('featuredOnly', 'true');
  if (params.verifiedOnly) sp.set('verifiedOnly', 'true');
  if (params.sort) sp.set('sort', params.sort);
  if (params.page) sp.set('page', String(params.page));
  if (params.pageSize) sp.set('pageSize', String(params.pageSize));
  return sp.toString();
}

export type SavedSearchRow = {
  id: string;
  name: string | null;
  query: string | null;
  filters: Record<string, unknown>;
  sort: string;
  notify: boolean;
  createdAt: string;
};

export function createSearchRepository(http: HttpClient) {
  return {
    async search(query: MarketplaceSearchQuery): Promise<Paginated<ListingCardModel>> {
      const data = await http.get<Paginated<ApiListing>>(
        `/v1/search?${toQuery(query)}`,
        false,
      );
      return {
        ...data,
        items: data.items.map((item) => mapListingToCard(item)),
      };
    },
    trending(days = 30, limit = 8) {
      return http.get<{
        brands: Array<{ id: string; nameEn: string; nameAr: string; slug: string; searchCount?: number }>;
        models: Array<{ id: string; nameEn: string; nameAr: string }>;
        categories: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
      }>(`/v1/search/trending?days=${days}&limit=${limit}`, false);
    },
    suggestions(q: string, limit = 8) {
      return http.get<
        Array<{ type: string; id?: string; label: string; meta?: Record<string, unknown> }>
      >(`/v1/search/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`, false);
    },
    listSaved() {
      return http.get<SavedSearchRow[]>('/v1/search/saved', true);
    },
    save(body: {
      name?: string;
      query?: string;
      filters: Record<string, unknown>;
      sort?: string;
      notify?: boolean;
    }) {
      return http.post<SavedSearchRow>('/v1/search/save', body, true);
    },
    deleteSaved(id: string) {
      return http.delete(`/v1/search/saved/${id}`, true);
    },
  };
}
