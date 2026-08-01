import { isPlateListing } from '../domain/marketplace-path';
import type { ListingDetailModel, MarketplaceDomainCode } from '../domain/types';

export type RecommendationContext = {
  listing: ListingDetailModel;
  limit?: number;
};

/** Domain-agnostic query shape consumed by vehicle/plate list hooks. */
export type RecommendationQuery = {
  domain: MarketplaceDomainCode;
  pageSize: number;
  sortBy: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder: 'asc' | 'desc';
  categoryCode?: string;
  cityId?: string;
  governorateId?: string;
  formatCode?: string;
  makeId?: string;
  excludeId: string;
};

/**
 * Pluggable recommendation strategy.
 * Swap implementations later (AI, popularity, geo score) without page refactors.
 */
export interface ListingRecommendationStrategy {
  readonly id: string;
  buildQuery(ctx: RecommendationContext): RecommendationQuery;
}

/** Vehicles: same category + city when available; recency sort. */
export class VehicleCategoryAffinityStrategy implements ListingRecommendationStrategy {
  readonly id = 'vehicle-category-affinity';

  buildQuery(ctx: RecommendationContext): RecommendationQuery {
    const { listing } = ctx;
    return {
      domain: 'VEHICLE',
      pageSize: ctx.limit ?? 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      categoryCode: listing.categoryCode,
      cityId: listing.cityId ?? undefined,
      governorateId: listing.governorateId ?? undefined,
      makeId: listing.specs?.brandId ?? undefined,
      excludeId: listing.id,
    };
  }
}

/** Plates: same governorate / format when available; recency sort. */
export class PlateAffinityStrategy implements ListingRecommendationStrategy {
  readonly id = 'plate-affinity';

  buildQuery(ctx: RecommendationContext): RecommendationQuery {
    const { listing } = ctx;
    return {
      domain: 'PLATE',
      pageSize: ctx.limit ?? 8,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      governorateId: listing.governorateId ?? undefined,
      formatCode: listing.plateDetails?.formatCode || undefined,
      excludeId: listing.id,
    };
  }
}

export function getListingRecommendationStrategy(
  listing: ListingDetailModel,
): ListingRecommendationStrategy {
  if (isPlateListing(listing)) return new PlateAffinityStrategy();
  return new VehicleCategoryAffinityStrategy();
}

export function buildRecommendationQuery(listing: ListingDetailModel, limit?: number) {
  return getListingRecommendationStrategy(listing).buildQuery({ listing, limit });
}
