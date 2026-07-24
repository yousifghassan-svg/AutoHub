import type { HttpClient } from '@/lib/api/http-client';
import type { Paginated } from '@/lib/api/types';
import {
  mapListingToCard,
  type ApiListing,
} from '@/features/listings/domain/mappers';
import type { ListingCardModel } from '@/features/listings/domain/types';
import type {
  DealerCard,
  DealerReviewsPlaceholder,
  DealerStatistics,
} from '../domain/types';

export type { DealerCard } from '../domain/types';

export function dealerActiveCount(dealer: DealerCard): number {
  return (
    dealer.listingCount ??
    dealer.statistics?.listingCount ??
    dealer.statistics?.activeListings ??
    0
  );
}

export type DealerProfile = DealerCard & {
  inventory: ListingCardModel[];
  statistics: Required<Pick<DealerStatistics, 'activeListings' | 'sold' | 'views' | 'followers'>>;
  reviews?: DealerReviewsPlaceholder;
};

export function createDealersRepository(http: HttpClient) {
  return {
    async list(query: {
      page?: number;
      pageSize?: number;
      q?: string;
      verifiedOnly?: boolean;
    }) {
      const sp = new URLSearchParams();
      if (query.page) sp.set('page', String(query.page));
      if (query.pageSize) sp.set('pageSize', String(query.pageSize));
      if (query.q) sp.set('q', query.q);
      if (query.verifiedOnly) sp.set('verifiedOnly', 'true');
      return http.get<Paginated<DealerCard>>(`/v1/dealers?${sp}`, false);
    },
    async getBySlug(slug: string): Promise<DealerProfile> {
      const data = await http.get<
        DealerCard & {
          inventory?: ApiListing[] | { items?: ApiListing[] };
          statistics: DealerProfile['statistics'];
          reviews?: DealerReviewsPlaceholder;
        }
      >(`/v1/dealers/${encodeURIComponent(slug)}`, false);
      const inventoryItems = Array.isArray(data.inventory)
        ? data.inventory
        : (data.inventory?.items ?? []);
      return {
        ...data,
        inventory: inventoryItems.map((item) => mapListingToCard(item)),
        statistics: {
          activeListings: data.statistics?.activeListings ?? 0,
          sold: data.statistics?.sold ?? 0,
          views: data.statistics?.views ?? 0,
          followers: data.statistics?.followers ?? 0,
        },
        reviews: data.reviews,
      };
    },
  };
}
