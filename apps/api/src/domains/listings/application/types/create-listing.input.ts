import type { LanguageCode } from '@autohub/database';

export type VehicleDetailsInput = {
  brandId?: string;
  modelId?: string;
  year?: number;
  mileageKm?: number;
  fuelTypeId?: string;
  transmissionTypeId?: string;
  driveTypeId?: string;
  bodyTypeId?: string;
  colorId?: string;
  engineTypeId?: string;
  engineSizeCc?: number;
  doors?: number;
};

export type CreateListingInput = {
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
  primaryCurrencyId?: string;
  secondaryPrice?: number;
  secondaryCurrencyId?: string;
  carDetails?: VehicleDetailsInput;
  vehicleDetails?: VehicleDetailsInput;
};
