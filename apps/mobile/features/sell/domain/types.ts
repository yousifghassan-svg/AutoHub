import type { WizardStep } from './steps';

export type MediaKind = 'IMAGE' | 'VIDEO' | '360_MEDIA';

export type WizardMediaItem = {
  localId: string;
  kind: MediaKind;
  /** Local file URI (device) */
  uri: string;
  mimeType: string;
  byteSize: number;
  filename: string;
  /** After media platform upload */
  assetId?: string;
  r2Key?: string;
  listingMediaId?: string;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'attached' | 'failed';
  error?: string;
};

export type VehicleDetailsForm = {
  year: string;
  mileageKm: string;
  brandId: string | null;
  brandLabel: string;
  modelId: string | null;
  modelLabel: string;
  engineSizeCc: string;
  doors: string;
};

export type WizardDraft = {
  localId: string;
  listingId: string | null;
  step: WizardStep;
  categoryId: string | null;
  categoryCode: string | null;
  categoryLabel: string;
  /** Condition / vehicle type code (NEW | USED | …) */
  vehicleTypeCode: string | null;
  vehicleTypeLabel: string;
  conditionTypeId: string | null;
  vehicleDetails: VehicleDetailsForm;
  media: WizardMediaItem[];
  cityId: string | null;
  cityLabel: string;
  primaryPrice: string;
  currencyCode: 'IQD' | 'USD';
  primaryCurrencyId: string | null;
  title: string;
  description: string;
  language: 'ar' | 'ku' | 'en';
  status: 'local' | 'draft' | 'pending' | 'submitted';
  createdAt: string;
  updatedAt: string;
};

export type CatalogCategory = {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
};

export type CatalogCity = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
};

export type CatalogVehicleType = {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
};

export type CreateListingPayload = {
  categoryId: string;
  cityId: string;
  title: string;
  description: string;
  language: 'ar' | 'ku' | 'en';
  primaryPrice?: number;
  currencyCode?: 'IQD' | 'USD' | string;
  primaryCurrencyId?: string;
  conditionTypeId?: string;
  vehicleDetails?: {
    brandId?: string;
    modelId?: string;
    year?: number;
    mileageKm?: number;
    engineSizeCc?: number;
    doors?: number;
  };
};
