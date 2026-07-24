export type SearchSort =
  | 'NEWEST'
  | 'OLDEST'
  | 'PRICE_LOW'
  | 'PRICE_HIGH'
  | 'MOST_VIEWED'
  | 'MOST_RELEVANT';

export type MarketplaceSearchQuery = {
  q?: string;
  categoryCode?: string;
  brandId?: string;
  modelId?: string;
  bodyTypeId?: string;
  colorId?: string;
  governorateId?: string;
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelTypeId?: string;
  transmissionTypeId?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
};

export const SEARCH_SORTS: Array<{ id: SearchSort; label: string }> = [
  { id: 'NEWEST', label: 'Newest' },
  { id: 'PRICE_LOW', label: 'Price: low to high' },
  { id: 'PRICE_HIGH', label: 'Price: high to low' },
  { id: 'MOST_VIEWED', label: 'Most viewed' },
  { id: 'MOST_RELEVANT', label: 'Most relevant' },
  { id: 'OLDEST', label: 'Oldest' },
];
