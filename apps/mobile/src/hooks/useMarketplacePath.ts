import type { MarketplaceCard, MarketplaceDomain } from '@/src/types/marketplace';

export function resolveDomain(item: {
  domain?: MarketplaceDomain | null;
  categoryCode?: string | null;
}): MarketplaceDomain {
  if (item.domain === 'PLATE' || item.categoryCode === 'PLATE') return 'PLATE';
  return 'VEHICLE';
}

export function marketplaceDetailPath(item: {
  id: string;
  domain?: MarketplaceDomain | null;
  categoryCode?: string | null;
}): string {
  return resolveDomain(item) === 'PLATE' ? `/plate/${item.id}` : `/vehicle/${item.id}`;
}

export function toMarketplaceCard(
  item: MarketplaceCard | (Omit<MarketplaceCard, 'domain'> & { domain?: MarketplaceDomain }),
): MarketplaceCard {
  return {
    ...item,
    domain: resolveDomain(item),
  };
}
