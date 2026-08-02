import type { HttpClient } from '@/lib/api/http-client';
import type { Paginated } from '@/lib/api/types';
import {
  mapListingToCard,
  mapListingToDetail,
  type ApiListing,
} from '@/features/listings/domain/mappers';
import type {
  ContactChannel,
  ListingCardModel,
  ListingDetailModel,
  ListingStatus,
} from '@/features/listings/domain/types';
import type { VehicleListQuery, VehicleSearchQuery } from '../domain/types';
import { toVehicleSearchQueryString } from './vehicle-search-api-query';

function toListQuery(params: VehicleListQuery): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.pageSize) sp.set('pageSize', String(params.pageSize));
  if (params.keyword) sp.set('keyword', params.keyword);
  if (params.categoryCode) sp.set('categoryCode', params.categoryCode);
  if (params.isFeatured != null) sp.set('isFeatured', String(params.isFeatured));
  if (params.mine) sp.set('mine', 'true');
  if (params.minPrice != null) sp.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) sp.set('maxPrice', String(params.maxPrice));
  if (params.currencyCode) sp.set('currencyCode', params.currencyCode);
  if (params.governorateId) sp.set('governorateId', params.governorateId);
  if (params.cityId) sp.set('cityId', params.cityId);
  if (params.makeId) sp.set('makeId', params.makeId);
  // Omit unspecified sort so list endpoints keep their own defaults.
  if (params.sortBy) {
    sp.set('sortBy', params.sortBy);
    sp.set('sortOrder', params.sortOrder ?? 'desc');
  }
  return sp.toString();
}

export type VehiclesRepository = {
  list(query: VehicleListQuery): Promise<Paginated<ListingCardModel>>;
  search(query: VehicleSearchQuery): Promise<Paginated<ListingCardModel>>;
  getById(id: string): Promise<ListingDetailModel>;
  create(body: Record<string, unknown>): Promise<ListingDetailModel>;
  update(id: string, body: Record<string, unknown>): Promise<ListingDetailModel>;
  changeStatus(id: string, status: ListingStatus): Promise<ListingDetailModel>;
  softDelete(id: string): Promise<void>;
  contactClick(id: string, channel: ContactChannel): Promise<void>;
};

export function createVehiclesRepository(http: HttpClient): VehiclesRepository {
  return {
    async list(query) {
      const data = await http.get<Paginated<ApiListing>>(
        `/v1/vehicles?${toListQuery(query)}`,
        Boolean(query.mine),
      );
      return {
        ...data,
        items: data.items.map((item) => mapListingToCard(item)),
      };
    },
    async search(query) {
      const data = await http.get<Paginated<ApiListing>>(
        `/v1/vehicles/search?${toVehicleSearchQueryString(query)}`,
        false,
      );
      return {
        ...data,
        items: data.items.map((item) => mapListingToCard(item)),
      };
    },
    async getById(id) {
      const data = await http.get<ApiListing>(`/v1/vehicles/${id}`, false);
      return mapListingToDetail(data);
    },
    async create(body) {
      const data = await http.post<ApiListing>('/v1/vehicles', body, true);
      return mapListingToDetail(data);
    },
    async update(id, body) {
      const data = await http.patch<ApiListing>(`/v1/vehicles/${id}`, body, true);
      return mapListingToDetail(data);
    },
    async changeStatus(id, status) {
      const data = await http.patch<ApiListing>(
        `/v1/vehicles/${id}/status`,
        { status },
        true,
      );
      return mapListingToDetail(data);
    },
    async softDelete(id) {
      await http.delete(`/v1/vehicles/${id}`, true);
    },
    async contactClick(id, channel) {
      await http.post(`/v1/vehicles/${id}/contact-click`, { channel }, false);
    },
  };
}
