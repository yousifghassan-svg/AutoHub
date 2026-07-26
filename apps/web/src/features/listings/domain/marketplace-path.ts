import type { ListingCategoryCode } from './types';

export type MarketplaceDomainCode = 'VEHICLE' | 'PLATE';

export function isPlateListing(listing: {
  domain?: MarketplaceDomainCode | null;
  categoryCode?: string | null;
}): boolean {
  return listing.domain === 'PLATE' || listing.categoryCode === 'PLATE';
}

/** Canonical public detail path for a marketplace item. */
export function marketplaceDetailPath(listing: {
  id: string;
  domain?: MarketplaceDomainCode | null;
  categoryCode?: ListingCategoryCode | string | null;
}): string {
  return isPlateListing(listing) ? `/plates/${listing.id}` : `/vehicles/${listing.id}`;
}

export function marketplaceSearchPath(listing: {
  domain?: MarketplaceDomainCode | null;
  categoryCode?: string | null;
}): string {
  if (isPlateListing(listing)) return '/plates/search';
  const category =
    listing.categoryCode && listing.categoryCode !== 'PLATE'
      ? `?category=${listing.categoryCode}`
      : '';
  return `/vehicles/search${category}`;
}
