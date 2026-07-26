import type { CatalogCategory, CatalogCity, CatalogVehicleType } from '../domain/types';

/** Stable mock IDs for offline / Expo Go. API mode may overlay real IDs. */
export const CATALOG_CATEGORIES: CatalogCategory[] = [
  { id: 'cat-car', code: 'CAR', nameEn: 'Cars', nameAr: 'سيارات' },
  { id: 'cat-plate', code: 'PLATE', nameEn: 'Plates', nameAr: 'أرقام' },
  { id: 'cat-moto', code: 'MOTORCYCLE', nameEn: 'Motorcycles', nameAr: 'دراجات' },
  { id: 'cat-truck', code: 'TRUCK', nameEn: 'Trucks', nameAr: 'شاحنات' },
  {
    id: 'cat-heavy',
    code: 'HEAVY_EQUIPMENT',
    nameEn: 'Heavy equipment',
    nameAr: 'معدات ثقيلة',
  },
];

export const CATALOG_VEHICLE_TYPES: CatalogVehicleType[] = [
  { id: 'cond-new', code: 'NEW', nameEn: 'New', nameAr: 'جديد' },
  { id: 'cond-used', code: 'USED', nameEn: 'Used', nameAr: 'مستعمل' },
  { id: 'cond-certified', code: 'CERTIFIED', nameEn: 'Certified', nameAr: 'معتمد' },
];

export const CATALOG_CITIES: CatalogCity[] = [
  { id: 'city-baghdad', slug: 'baghdad', nameEn: 'Baghdad', nameAr: 'بغداد' },
  { id: 'city-erbil', slug: 'erbil', nameEn: 'Erbil', nameAr: 'أربيل' },
  { id: 'city-sulaymaniyah', slug: 'sulaymaniyah', nameEn: 'Sulaymaniyah', nameAr: 'السليمانية' },
  { id: 'city-basra', slug: 'basra', nameEn: 'Basra', nameAr: 'البصرة' },
  { id: 'city-mosul', slug: 'mosul', nameEn: 'Mosul', nameAr: 'الموصل' },
  { id: 'city-kirkuk', slug: 'kirkuk', nameEn: 'Kirkuk', nameAr: 'كركوك' },
  { id: 'city-najaf', slug: 'najaf', nameEn: 'Najaf', nameAr: 'النجف' },
  { id: 'city-karbala', slug: 'karbala', nameEn: 'Karbala', nameAr: 'كربلاء' },
];

/** @deprecated Prefer currencyCode on create/update; catalog resolves codes server-side. */
export const MOCK_CURRENCY_IDS = {
  IQD: 'IQD',
  USD: 'USD',
} as const;
