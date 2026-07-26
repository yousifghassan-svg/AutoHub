import {
  ListingCategoryCode,
  MarketplaceDomain,
} from '@autohub/database';

/** Marketplace domain discriminator for plate listings. */
export const PLATE_MARKETPLACE_DOMAIN = MarketplaceDomain.PLATE;

/** Listing hub category code for plates. */
export const PLATE_LISTING_CATEGORY = ListingCategoryCode.PLATE;

export const PLATE_DEFAULT_PAGE = 1;
export const PLATE_DEFAULT_PAGE_SIZE = 20;
export const PLATE_MAX_PAGE_SIZE = 100;

export const PLATE_DEFAULT_SORT_BY = 'publishedAt' as const;
export const PLATE_DEFAULT_SORT_ORDER = 'desc' as const;

export type PlateSortBy = 'createdAt' | 'primaryPrice' | 'publishedAt';
