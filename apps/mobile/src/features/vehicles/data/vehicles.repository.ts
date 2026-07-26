import { mapListingToCard } from '@/features/home/domain/mappers';
import type { HttpClient } from '@/lib/api/http-client';
import { toQueryString } from '@/src/lib/query';
import type { MarketplaceCard, Paginated } from '@/src/types/marketplace';

export type VehicleListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isFeatured?: boolean;
  mine?: boolean;
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
  makeId?: string;
  modelId?: string;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
};

type ApiPage = {
  items: Parameters<typeof mapListingToCard>[0][];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function toCard(
  item: Parameters<typeof mapListingToCard>[0],
  locale: 'ar' | 'ku' | 'en',
): MarketplaceCard {
  const card = mapListingToCard(item, locale);
  return {
    ...card,
    domain: 'VEHICLE',
    categoryCode: card.categoryCode === 'PLATE' ? 'CAR' : card.categoryCode,
  };
}

export type VehiclesRepository = {
  list(query: VehicleListQuery): Promise<Paginated<MarketplaceCard>>;
  search(query: VehicleListQuery): Promise<Paginated<MarketplaceCard>>;
  getById(id: string): Promise<MarketplaceCard & { description?: string }>;
  featured(pageSize?: number): Promise<MarketplaceCard[]>;
  newest(pageSize?: number): Promise<MarketplaceCard[]>;
};

export function createVehiclesRepository(
  http: HttpClient,
  locale: 'ar' | 'ku' | 'en' = 'ar',
): VehiclesRepository {
  return {
    async list(query) {
      const data = await http.get<ApiPage>(
        `/v1/vehicles${toQueryString({
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
          keyword: query.keyword,
          isFeatured: query.isFeatured,
          mine: query.mine,
          sortBy: query.sortBy ?? 'createdAt',
          sortOrder: query.sortOrder ?? 'desc',
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          currencyCode: query.currencyCode,
        })}`,
        Boolean(query.mine),
      );
      return { ...data, items: data.items.map((item) => toCard(item, locale)) };
    },
    async search(query) {
      const data = await http.get<ApiPage>(
        `/v1/vehicles/search${toQueryString({
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
          keyword: query.keyword,
          makeId: query.makeId,
          modelId: query.modelId,
          minYear: query.minYear,
          maxYear: query.maxYear,
          minMileage: query.minMileage,
          currencyCode: query.currencyCode,
          maxMileage: query.maxMileage,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          sortBy: query.sortBy ?? 'createdAt',
          sortOrder: query.sortOrder ?? 'desc',
        })}`,
        false,
      );
      return { ...data, items: data.items.map((item) => toCard(item, locale)) };
    },
    async getById(id) {
      const data = await http.get<Parameters<typeof mapListingToCard>[0]>(
        `/v1/vehicles/${id}`,
        false,
      );
      return toCard(data, locale);
    },
    async featured(pageSize = 10) {
      const page = await this.list({ page: 1, pageSize, isFeatured: true });
      return page.items;
    },
    async newest(pageSize = 10) {
      const page = await this.list({
        page: 1,
        pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      return page.items;
    },
  };
}
