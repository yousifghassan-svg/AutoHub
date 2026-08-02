export type SearchSort =
  | 'NEWEST'
  | 'OLDEST'
  | 'PRICE_LOW'
  | 'PRICE_HIGH'
  | 'MOST_VIEWED'
  | 'MOST_RELEVANT';

export type MarketplaceDomainFilter = 'VEHICLE' | 'PLATE';

export type MarketplaceSearchQuery = {
  q?: string;
  domain?: MarketplaceDomainFilter;
  categoryCode?: string;
  brandId?: string;
  modelId?: string;
  bodyTypeId?: string;
  colorId?: string;
  driveTypeId?: string;
  conditionTypeId?: string;
  governorateId?: string;
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelTypeId?: string;
  transmissionTypeId?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
  formatCode?: string;
  prefix?: string;
  series?: string;
  number?: string;
  digits?: number;
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
};

export type SearchFacets = {
  categories: Array<{ id: string; label: string; count: number; code?: string }>;
  brands: Array<{ id: string; label: string; count: number }>;
  governorates: Array<{ id: string; label: string; count: number }>;
  cities: Array<{ id: string; label: string; count: number }>;
  featured: { count: number };
  verified: { count: number };
};

export const SEARCH_SORTS: Array<{ id: SearchSort; label: string }> = [
  { id: 'NEWEST', label: 'Newest' },
  { id: 'PRICE_LOW', label: 'Price: low to high' },
  { id: 'PRICE_HIGH', label: 'Price: high to low' },
  { id: 'MOST_VIEWED', label: 'Most viewed' },
  { id: 'MOST_RELEVANT', label: 'Most relevant' },
  { id: 'OLDEST', label: 'Oldest' },
];
