import type { LanguageCode } from '@autohub/database';
import type { VehicleDetailsInput } from '../../../listings/application/types/create-listing.input';

export type CreateVehicleInput = {
  categoryId: string;
  cityId: string;
  countryId?: string;
  conditionTypeId?: string;
  title: string;
  description: string;
  language?: LanguageCode;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryPrice?: number;
  currencyCode?: string;
  primaryCurrencyId?: string;
  secondaryPrice?: number;
  secondaryCurrencyId?: string;
  vehicleDetails?: VehicleDetailsInput;
};

export type UpdateVehicleInput = {
  cityId?: string;
  countryId?: string;
  conditionTypeId?: string | null;
  title?: string;
  description?: string;
  language?: LanguageCode;
  metaTitle?: string;
  metaDescription?: string;
  primaryPrice?: number;
  currencyCode?: string;
  primaryCurrencyId?: string;
  secondaryPrice?: number;
  secondaryCurrencyId?: string;
  isFeatured?: boolean;
  vehicleDetails?: VehicleDetailsInput;
};

export type ListVehiclesInput = {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
  cityId?: string;
  governorateId?: string;
  categoryId?: string;
  categoryCode?: import('@autohub/database').ListingCategoryCode;
  brandId?: string;
  modelId?: string;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  status?: import('@autohub/database').ListingStatus;
  statuses?: import('@autohub/database').ListingStatus[];
  isFeatured?: boolean;
  keyword?: string;
  sellerId?: string;
  mine?: boolean;
};

export type SearchVehiclesInput = ListVehiclesInput & {
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelTypeId?: string;
  transmissionTypeId?: string;
  bodyTypeId?: string;
  driveTypeId?: string;
  colorId?: string;
};
