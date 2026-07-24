import type { LanguageCode } from '@autohub/database';
import type { PlateDetailsInput, VehicleDetailsInput } from './create-listing.input';

export type UpdateListingInput = {
  cityId?: string;
  countryId?: string;
  categoryId?: string;
  conditionTypeId?: string | null;
  title?: string;
  description?: string;
  language?: LanguageCode;
  metaTitle?: string;
  metaDescription?: string;
  primaryPrice?: number;
  primaryCurrencyId?: string;
  secondaryPrice?: number;
  secondaryCurrencyId?: string;
  isFeatured?: boolean;
  carDetails?: VehicleDetailsInput;
  vehicleDetails?: VehicleDetailsInput;
  plateDetails?: PlateDetailsInput;
};
