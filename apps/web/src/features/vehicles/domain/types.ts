import type { ListingCategoryCode } from '@/features/listings/domain/types';

export const VEHICLE_CATEGORY_CODES: ListingCategoryCode[] = [
  'CAR',
  'MOTORCYCLE',
  'TRUCK',
  'HEAVY_EQUIPMENT',
];

export function isVehicleCategory(code: string | undefined | null): boolean {
  return Boolean(code && code !== 'PLATE');
}

export type VehicleListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryCode?: ListingCategoryCode;
  isFeatured?: boolean;
  mine?: boolean;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  governorateId?: string;
  cityId?: string;
  makeId?: string;
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt' | 'relevance';
  sortOrder?: 'asc' | 'desc';
};

export type VehicleSearchQuery = VehicleListQuery & {
  makeId?: string;
  modelId?: string;
  bodyTypeId?: string;
  fuelTypeId?: string;
  transmissionTypeId?: string;
  driveTypeId?: string;
  colorId?: string;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
};

export type VehicleSortOption = {
  sortBy: NonNullable<VehicleListQuery['sortBy']>;
  sortOrder: NonNullable<VehicleListQuery['sortOrder']>;
  label: string;
};

export const VEHICLE_SORTS: VehicleSortOption[] = [
  { sortBy: 'createdAt', sortOrder: 'desc', label: 'Newest' },
  { sortBy: 'primaryPrice', sortOrder: 'asc', label: 'Price: low to high' },
  { sortBy: 'primaryPrice', sortOrder: 'desc', label: 'Price: high to low' },
  { sortBy: 'publishedAt', sortOrder: 'desc', label: 'Recently published' },
  { sortBy: 'createdAt', sortOrder: 'asc', label: 'Oldest' },
];
