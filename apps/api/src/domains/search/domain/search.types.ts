import type { ListingCategoryCode } from '@autohub/database';

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
  categoryId?: string;
  categoryCode?: ListingCategoryCode;
  brandId?: string;
  modelId?: string;
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
  bodyTypeId?: string;
  driveTypeId?: string;
  conditionTypeId?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
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
