import type {
  ListingCategoryCode,
  MarketplaceDomain,
  PlateVerificationStatus,
} from '@autohub/database';

export enum SearchSort {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  PRICE_LOW = 'PRICE_LOW',
  PRICE_HIGH = 'PRICE_HIGH',
  MOST_VIEWED = 'MOST_VIEWED',
  MOST_RELEVANT = 'MOST_RELEVANT',
}

export type SearchFilters = {
  q?: string;
  domain?: MarketplaceDomain;
  categoryId?: string;
  categoryCode?: ListingCategoryCode;
  brandId?: string;
  modelId?: string;
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
  bodyTypeId?: string;
  colorId?: string;
  driveTypeId?: string;
  conditionTypeId?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
  /** Plate-specific (used when domain=PLATE or plate filters present). */
  formatCode?: string;
  prefix?: string;
  series?: string;
  number?: string;
  digits?: number;
  plateCategoryId?: string;
  platePrefixId?: string;
  plateVerificationStatus?: PlateVerificationStatus;
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
};

export type SuggestionType =
  | 'BRAND'
  | 'MODEL'
  | 'CITY'
  | 'PLATE'
  | 'KEYWORD';

export type SearchSuggestion = {
  type: SuggestionType;
  id?: string;
  label: string;
  meta?: Record<string, string | number | null | undefined>;
};

export type FacetBucket = {
  id: string;
  label: string;
  count: number;
  /** Present for category facets (matches ListingCategory.code). */
  code?: string;
};

export type SearchFacets = {
  categories: FacetBucket[];
  brands: FacetBucket[];
  governorates: FacetBucket[];
  cities: FacetBucket[];
  featured: { count: number };
  verified: { count: number };
};
