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

export type PlateListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  governorateId?: string;
  formatCode?: string;
  prefix?: string;
  series?: string;
  number?: string;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  mine?: boolean;
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
};

function toQuery(params: PlateListQuery): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.pageSize) sp.set('pageSize', String(params.pageSize));
  if (params.keyword) sp.set('keyword', params.keyword);
  if (params.governorateId) sp.set('governorateId', params.governorateId);
  if (params.formatCode) sp.set('formatCode', params.formatCode);
  if (params.prefix) sp.set('prefix', params.prefix);
  if (params.series) sp.set('series', params.series);
  if (params.number) sp.set('number', params.number);
  if (params.minPrice != null) sp.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) sp.set('maxPrice', String(params.maxPrice));
  if (params.currencyCode) sp.set('currencyCode', params.currencyCode);
  if (params.mine) sp.set('mine', 'true');
  sp.set('sortBy', params.sortBy ?? 'createdAt');
  sp.set('sortOrder', params.sortOrder ?? 'desc');
  return sp.toString();
}

export type PlatesRepository = {
  list(query: PlateListQuery): Promise<Paginated<ListingCardModel>>;
  search(query: PlateListQuery): Promise<Paginated<ListingCardModel>>;
  getById(id: string): Promise<ListingDetailModel>;
  create(body: Record<string, unknown>): Promise<ListingDetailModel>;
  update(id: string, body: Record<string, unknown>): Promise<ListingDetailModel>;
  changeStatus(id: string, status: ListingStatus): Promise<ListingDetailModel>;
  softDelete(id: string): Promise<void>;
  contactClick(id: string, channel: ContactChannel): Promise<void>;
};

export function createPlatesRepository(http: HttpClient): PlatesRepository {
  return {
    async list(query) {
      const data = await http.get<Paginated<ApiListing>>(
        `/v1/plates?${toQuery(query)}`,
        Boolean(query.mine),
      );
      return {
        ...data,
        items: data.items.map((item) => mapListingToCard(item)),
      };
    },
    async search(query) {
      const data = await http.get<Paginated<ApiListing>>(
        `/v1/plates/search?${toQuery(query)}`,
        false,
      );
      return {
        ...data,
        items: data.items.map((item) => mapListingToCard(item)),
      };
    },
    async getById(id) {
      const data = await http.get<ApiListing>(`/v1/plates/${id}`, false);
      return mapListingToDetail(data);
    },
    async create(body) {
      const data = await http.post<ApiListing>('/v1/plates', body, true);
      return mapListingToDetail(data);
    },
    async update(id, body) {
      const data = await http.patch<ApiListing>(`/v1/plates/${id}`, body, true);
      return mapListingToDetail(data);
    },
    async changeStatus(id, status) {
      const data = await http.patch<ApiListing>(
        `/v1/plates/${id}/status`,
        { status },
        true,
      );
      return mapListingToDetail(data);
    },
    async softDelete(id) {
      await http.delete(`/v1/plates/${id}`, true);
    },
    async contactClick(id, channel) {
      await http.post(`/v1/plates/${id}/contact-click`, { channel }, false);
    },
  };
}
