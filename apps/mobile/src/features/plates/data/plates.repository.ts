import { mapListingToCard } from '@/features/home/domain/mappers';
import type { HttpClient } from '@/lib/api/http-client';
import { toQueryString } from '@/src/lib/query';
import type { MarketplaceCard, Paginated } from '@/src/types/marketplace';

export type PlateListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  formatCode?: string;
  prefix?: string;
  series?: string;
  number?: string;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  mine?: boolean;
  isFeatured?: boolean;
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
};

type ApiListing = Parameters<typeof mapListingToCard>[0] & {
  plateDetails?: {
    plateDisplay?: string | null;
    series?: string | null;
    number?: string | null;
    regionCode?: string | null;
    formatCode?: string;
  } | null;
  isFeatured?: boolean;
};

type ApiPage = {
  items: ApiListing[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function toCard(item: ApiListing, locale: 'ar' | 'ku' | 'en'): MarketplaceCard {
  const card = mapListingToCard(item, locale);
  return {
    ...card,
    domain: 'PLATE',
    categoryCode: 'PLATE',
    plateDisplay: item.plateDetails?.plateDisplay ?? null,
    isFeatured: Boolean(item.isFeatured ?? card.isFeatured),
  };
}

export type PlatesRepository = {
  list(query: PlateListQuery): Promise<Paginated<MarketplaceCard>>;
  search(query: PlateListQuery): Promise<Paginated<MarketplaceCard>>;
  getById(id: string): Promise<MarketplaceCard>;
  featured(pageSize?: number): Promise<MarketplaceCard[]>;
  newest(pageSize?: number): Promise<MarketplaceCard[]>;
};

export function createPlatesRepository(
  http: HttpClient,
  locale: 'ar' | 'ku' | 'en' = 'ar',
): PlatesRepository {
  return {
    async list(query) {
      const data = await http.get<ApiPage>(
        `/v1/plates${toQueryString({
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
          keyword: query.keyword,
          formatCode: query.formatCode,
          prefix: query.prefix,
          series: query.series,
          number: query.number,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          currencyCode: query.currencyCode,
          mine: query.mine,
          sortBy: query.sortBy ?? 'createdAt',
          sortOrder: query.sortOrder ?? 'desc',
        })}`,
        Boolean(query.mine),
      );
      let items = data.items.map((item) => toCard(item, locale));
      if (query.isFeatured) items = items.filter((x) => x.isFeatured);
      return { ...data, items };
    },
    async search(query) {
      const data = await http.get<ApiPage>(
        `/v1/plates/search${toQueryString({
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
          keyword: query.keyword,
          formatCode: query.formatCode,
          prefix: query.prefix ?? query.series,
          series: query.series,
          number: query.number,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          currencyCode: query.currencyCode,
          sortBy: query.sortBy ?? 'createdAt',
          sortOrder: query.sortOrder ?? 'desc',
        })}`,
        false,
      );
      return { ...data, items: data.items.map((item) => toCard(item, locale)) };
    },
    async getById(id) {
      const data = await http.get<ApiListing>(`/v1/plates/${id}`, false);
      return toCard(data, locale);
    },
    async featured(pageSize = 10) {
      const page = await this.list({ page: 1, pageSize: pageSize * 2 });
      const featured = page.items.filter((x) => x.isFeatured);
      return (featured.length ? featured : page.items).slice(0, pageSize);
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
