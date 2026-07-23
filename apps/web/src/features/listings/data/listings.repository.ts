import type { HttpClient } from '@/lib/api/http-client';
import type { Paginated } from '@/lib/api/types';
import {
  mapListingToCard,
  mapListingToDetail,
  type ApiListing,
} from '../domain/mappers';
import type { ListingCardModel, ListingDetailModel, ListingStatus } from '../domain/types';

export type ListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryCode?: string;
  isFeatured?: boolean;
  mine?: boolean;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
};

function toQuery(params: ListQuery): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.pageSize) sp.set('pageSize', String(params.pageSize));
  if (params.keyword) sp.set('keyword', params.keyword);
  if (params.categoryCode) sp.set('categoryCode', params.categoryCode);
  if (params.isFeatured != null) sp.set('isFeatured', String(params.isFeatured));
  if (params.mine) sp.set('mine', 'true');
  if (params.status) sp.set('status', params.status);
  if (params.minPrice != null) sp.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) sp.set('maxPrice', String(params.maxPrice));
  sp.set('sortBy', params.sortBy ?? 'createdAt');
  sp.set('sortOrder', params.sortOrder ?? 'desc');
  return sp.toString();
}

export type ListingsRepository = {
  list(query: ListQuery): Promise<Paginated<ListingCardModel>>;
  getById(id: string): Promise<ListingDetailModel>;
  create(body: Record<string, unknown>): Promise<ListingDetailModel>;
  update(id: string, body: Record<string, unknown>): Promise<ListingDetailModel>;
  changeStatus(id: string, status: ListingStatus): Promise<ListingDetailModel>;
  softDelete(id: string): Promise<void>;
};

export function createListingsRepository(http: HttpClient): ListingsRepository {
  return {
    async list(query) {
      const data = await http.get<Paginated<ApiListing>>(
        `/v1/listings?${toQuery(query)}`,
        Boolean(query.mine),
      );
      return {
        ...data,
        items: data.items.map((item) => mapListingToCard(item)),
      };
    },
    async getById(id) {
      const data = await http.get<ApiListing>(`/v1/listings/${id}`, false);
      return mapListingToDetail(data);
    },
    async create(body) {
      const data = await http.post<ApiListing>('/v1/listings', body, true);
      return mapListingToDetail(data);
    },
    async update(id, body) {
      const data = await http.patch<ApiListing>(`/v1/listings/${id}`, body, true);
      return mapListingToDetail(data);
    },
    async changeStatus(id, status) {
      const data = await http.patch<ApiListing>(
        `/v1/listings/${id}/status`,
        { status },
        true,
      );
      return mapListingToDetail(data);
    },
    async softDelete(id) {
      await http.delete(`/v1/listings/${id}`, true);
    },
  };
}
