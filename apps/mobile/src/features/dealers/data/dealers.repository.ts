import type { HttpClient } from '@/lib/api/http-client';
import { toQueryString } from '@/src/lib/query';
import type { DealerCard, Paginated } from '@/src/types/marketplace';

type ApiDealer = {
  id: string;
  slug: string;
  name: string;
  verified?: boolean;
  isVerified?: boolean;
  logoUrl?: string | null;
  city?: { nameEn?: string; nameAr?: string } | null;
  _count?: { listings?: number };
};

function mapDealer(d: ApiDealer): DealerCard {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    verified: Boolean(d.verified ?? d.isVerified),
    logoUrl: d.logoUrl ?? null,
    cityName: d.city?.nameEn ?? d.city?.nameAr ?? null,
    listingCount: d._count?.listings,
  };
}

export type DealersRepository = {
  list(page?: number, pageSize?: number): Promise<Paginated<DealerCard>>;
  getById(id: string): Promise<DealerCard>;
};

export function createDealersRepository(http: HttpClient): DealersRepository {
  return {
    async list(page = 1, pageSize = 12) {
      const data = await http.get<{
        items: ApiDealer[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      }>(`/v1/dealers${toQueryString({ page, pageSize })}`, false);

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
