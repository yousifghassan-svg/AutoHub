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
  vin?: string;
  trim?: string;
  seats?: number;
  interiorColor?: string;
};

export type PlateDetailsInput = {
  formatCode: string;
  plateDisplay: string;
  plateNormalized?: string;
  series?: string;
  number?: string;
  regionCode?: string;
  plateType?: string;
};

export type CreateListingInput = {
  categoryId: string;
  cityId: string;
  countryId?: string;
  conditionTypeId?: string;
  /** Optional for sparse DRAFT create; placeholders used when omitted. */
  title?: string;
  description?: string;
  language?: LanguageCode;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryPrice?: number;
  /** Prefer currencyCode; primaryCurrencyId kept for backward compatibility. */
  currencyCode?: string;
  primaryCurrencyId?: string;
  secondaryPrice?: number;
  secondaryCurrencyId?: string;
  features?: string[];
  draftStep?: string | null;
  carDetails?: VehicleDetailsInput;
  vehicleDetails?: VehicleDetailsInput;
  plateDetails?: PlateDetailsInput;
};
