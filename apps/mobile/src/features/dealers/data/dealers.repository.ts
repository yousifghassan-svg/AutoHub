import type { HttpClient } from '@/lib/api/http-client';
import { toQueryString } from '@/src/lib/query';
import type { DealerCard, Paginated } from '@/src/types/marketplace';

type ApiDealer = {
  id: string;
  slug: string;
  name: string;
  verified?: boolean;
  isVerified?: boolean;
  verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  logoUrl?: string | null;
  city?: { nameEn?: string; nameAr?: string } | null;
  _count?: { listings?: number };
};

function mapDealer(d: ApiDealer): DealerCard {
  const verified =
    d.verificationStatus === 'VERIFIED' || Boolean(d.verified ?? d.isVerified);
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    verified,
    logoUrl: d.logoUrl ?? null,
    cityName: d.city?.nameEn ?? d.city?.nameAr ?? null,
    listingCount: d._count?.listings,
  };
}

export type DealersListQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  verifiedOnly?: boolean;
  cityId?: string;
  governorateId?: string;
};

export type DealersRepository = {
  list(pageOrQuery?: number | DealersListQuery, pageSize?: number): Promise<Paginated<DealerCard>>;
  getById(id: string): Promise<DealerCard>;
};

export function createDealersRepository(http: HttpClient): DealersRepository {
  return {
    async list(pageOrQuery = 1, pageSize = 12) {
      const query: DealersListQuery =
        typeof pageOrQuery === 'object'
          ? pageOrQuery
          : { page: pageOrQuery, pageSize };
      const data = await http.get<{
        items: ApiDealer[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      }>(
        `/v1/dealers${toQueryString({
          page: query.page ?? 1,
          pageSize: query.pageSize ?? pageSize,
          q: query.q,
          verifiedOnly: query.verifiedOnly ? true : undefined,
          cityId: query.cityId,
          governorateId: query.governorateId,
        })}`,
        false,
      );

      return {
        ...data,
        items: data.items.map(mapDealer),
      };
    },
    async getById(idOrSlug) {
      // Public API resolves by slug; callers may pass id or slug.
      const data = await http.get<ApiDealer>(
        `/v1/dealers/${encodeURIComponent(idOrSlug)}`,
        false,
      );
      return mapDealer(data);
    },
  };
}
