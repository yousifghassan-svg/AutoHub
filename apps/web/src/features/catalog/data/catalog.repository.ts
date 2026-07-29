import type { HttpClient } from '@/lib/api/http-client';

export type CatalogCategory = {
  id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameAr: string;
};

export type CatalogModel = {
  id: string;
  brandId: string;
  nameEn: string;
  nameAr: string;
  slug: string;
};

export type CatalogFilters = {
  brands: Array<{ id: string; nameEn: string; nameAr: string; slug: string }>;
  models: CatalogModel[];
  categories: CatalogCategory[];
  fuelTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  transmissionTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  colors: Array<{
    id: string;
    code: string;
    nameEn: string;
    nameAr: string;
    hex?: string | null;
  }>;
  governorates: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  cities: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    governorateId: string;
    slug: string;
  }>;
  bodyTypes: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  driveTypes?: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  engineTypes?: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
  conditionTypes?: Array<{ id: string; code: string; nameEn: string; nameAr: string }>;
};

export function createCatalogRepository(http: HttpClient) {
  return {
    filters() {
  return Promise.resolve({
    categories: [
      { id: 'car', code: 'CAR', slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات' },
      { id: 'plate', code: 'PLATE', slug: 'plates', nameEn: 'Plates', nameAr: 'لوحات' },
      { id: 'motorcycle', code: 'MOTORCYCLE', slug: 'motorcycles', nameEn: 'Motorcycles', nameAr: 'دراجات' },
      { id: 'truck', code: 'TRUCK', slug: 'trucks', nameEn: 'Trucks', nameAr: 'شاحنات' },
      { id: 'equipment', code: 'HEAVY_EQUIPMENT', slug: 'equipment', nameEn: 'Heavy Equipment', nameAr: 'معدات ثقيلة' },
    ],
    governorates: [
      { id: 'erbil', code: 'ERBIL', nameEn: 'Erbil', nameAr: 'أربيل' },
      { id: 'baghdad', code: 'BAGHDAD', nameEn: 'Baghdad', nameAr: 'بغداد' },
      { id: 'basra', code: 'BASRA', nameEn: 'Basra', nameAr: 'البصرة' },
    ],
    cities: [
      { id: 'erbil-city', governorateId: 'erbil', slug: 'erbil', nameEn: 'Erbil', nameAr: 'أربيل' },
      { id: 'baghdad-city', governorateId: 'baghdad', slug: 'baghdad', nameEn: 'Baghdad', nameAr: 'بغداد' },
      { id: 'basra-city', governorateId: 'basra', slug: 'basra', nameEn: 'Basra', nameAr: 'البصرة' },
    ],
    brands: [
      { id: 'toyota', slug: 'toyota', nameEn: 'Toyota', nameAr: 'تويوتا' },
      { id: 'bmw', slug: 'bmw', nameEn: 'BMW', nameAr: 'بي إم دبليو' },
      { id: 'mercedes', slug: 'mercedes', nameEn: 'Mercedes-Benz', nameAr: 'مرسيدس' },
    ],
    models: [
      { id: 'camry', brandId: 'toyota', slug: 'camry', nameEn: 'Camry', nameAr: 'كامري' },
      { id: 'land-cruiser', brandId: 'toyota', slug: 'land-cruiser', nameEn: 'Land Cruiser', nameAr: 'لاند كروزر' },
      { id: 'x5', brandId: 'bmw', slug: 'x5', nameEn: 'X5', nameAr: 'X5' },
    ],
    fuelTypes: [] as CatalogFilters['fuelTypes'],
    transmissionTypes: [] as CatalogFilters['transmissionTypes'],
    colors: [] as CatalogFilters['colors'],
    bodyTypes: [] as CatalogFilters['bodyTypes'],
    driveTypes: [] as NonNullable<CatalogFilters['driveTypes']>,
    engineTypes: [] as NonNullable<CatalogFilters['engineTypes']>,
    conditionTypes: [] as NonNullable<CatalogFilters['conditionTypes']>,
  });
},
  };
}
