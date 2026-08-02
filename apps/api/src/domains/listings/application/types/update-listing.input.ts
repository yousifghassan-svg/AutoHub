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
  currencyCode?: string;
  primaryCurrencyId?: string;
  secondaryPrice?: number;
  secondaryCurrencyId?: string;
  isFeatured?: boolean;
  features?: string[];
  draftStep?: string | null;
  carDetails?: VehicleDetailsInput;
  vehicleDetails?: VehicleDetailsInput;
  plateDetails?: PlateDetailsInput;
};
