export type MarketplaceDomain = 'VEHICLE' | 'PLATE';

export type MarketplaceCard = {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currencyCode: string;
  location: string;
  mileageKm: number | null;
  year: number | null;
  isVerified: boolean;
  isFavorite?: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  thumbnailKey: string | null;
  categoryCode: string;
  domain: MarketplaceDomain;
  plateDisplay?: string | null;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type DealerCard = {
  id: string;
  slug: string;
  name: string;
  cityName?: string | null;
  verified: boolean;
  logoUrl?: string | null;
  listingCount?: number;
};
