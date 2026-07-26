import { ListingCategoryCode } from '@autohub/database';

/** Matches Prisma `MarketplaceDomain.VEHICLE` (Sprint 20). */
export const VEHICLE_DOMAIN = 'VEHICLE' as const;

/** Category codes owned by the Vehicles domain — never PLATE. */
export const VEHICLE_CATEGORY_CODES: readonly ListingCategoryCode[] = [
  ListingCategoryCode.CAR,
  ListingCategoryCode.MOTORCYCLE,
  ListingCategoryCode.TRUCK,
  ListingCategoryCode.HEAVY_EQUIPMENT,
  ListingCategoryCode.PARTS,
  ListingCategoryCode.RENTAL,
] as const;
