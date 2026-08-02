import { Prisma } from '@autohub/database';

export type VehicleSortBy =
  | 'createdAt'
  | 'primaryPrice'
  | 'publishedAt'
  | 'relevance';

export type VehicleSortOrder = 'asc' | 'desc';

/**
 * P4-2 relevance heuristic (no ts_rank):
 * featured → verified → views → publishedAt.
 */
export function buildVehicleOrderBy(
  sortBy: VehicleSortBy,
  sortOrder: VehicleSortOrder,
): Prisma.ListingOrderByWithRelationInput | Prisma.ListingOrderByWithRelationInput[] {
  if (sortBy === 'relevance') {
    return [
      { isFeatured: 'desc' },
      { isVerified: 'desc' },
      { viewsCount: 'desc' },
      { publishedAt: 'desc' },
    ];
  }
  return { [sortBy]: sortOrder };
}
