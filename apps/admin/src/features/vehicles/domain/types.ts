import type { ListingStatus } from '@/lib/api/types';

export type VehicleFormValues = {
  title: string;
  description: string;
  categoryId: string;
  status: ListingStatus;
  brandId: string;
  modelId: string;
  trim: string;
  year: string;
  mileageKm: string;
  primaryPrice: string;
  /** Active currency code (IQD | USD | …). */
  currencyCode: string;
  primaryCurrencyId: string;
  vin: string;
  engineTypeId: string;
  engineSizeCc: string;
  transmissionTypeId: string;
  fuelTypeId: string;
  driveTypeId: string;
  bodyTypeId: string;
  colorId: string;
  interiorColor: string;
  doors: string;
  seats: string;
  conditionTypeId: string;
  governorateId: string;
  cityId: string;
  locationText: string;
  latitude: string;
  longitude: string;
  sellerId: string;
  dealerId: string;
  isFeatured: boolean;
  isVerified: boolean;
};

export const emptyVehicleForm = (): VehicleFormValues => ({
  title: '',
  description: '',
  categoryId: '',
  status: 'DRAFT',
  brandId: '',
  modelId: '',
  trim: '',
  year: String(new Date().getFullYear()),
  mileageKm: '',
  primaryPrice: '',
  currencyCode: 'IQD',
  primaryCurrencyId: '',
  vin: '',
  engineTypeId: '',
  engineSizeCc: '',
  transmissionTypeId: '',
  fuelTypeId: '',
  driveTypeId: '',
  bodyTypeId: '',
  colorId: '',
  interiorColor: '',
  doors: '4',
  seats: '5',
  conditionTypeId: '',
  governorateId: '',
  cityId: '',
  locationText: '',
  latitude: '',
  longitude: '',
  sellerId: '',
  dealerId: '',
  isFeatured: false,
  isVerified: false,
});

export type CatalogFilters = {
  brands: Array<{ id: string; nameEn: string; nameAr: string; slug: string }>;
  models: Array<{
    id: string;
    brandId: string;
    nameEn: string;
    nameAr: string;
    slug: string;
  }>;
  fuelTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  transmissionTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  bodyTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  driveTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  engineTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  conditionTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  colors: Array<{ id: string; code: string; nameEn: string; nameAr: string; hex?: string | null }>;
  governorates: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  cities: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    governorateId: string;
    slug: string;
  }>;
  categories: Array<{
    id: string;
    code: string;
    slug: string;
    nameEn: string;
    nameAr: string;
  }>;
};
