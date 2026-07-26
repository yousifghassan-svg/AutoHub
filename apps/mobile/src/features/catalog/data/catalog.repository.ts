import type { HttpClient } from '@/lib/api/http-client';

export type CatalogOption = {
  id: string;
  code?: string;
  nameEn: string;
  nameAr: string;
  slug?: string;
  brandId?: string;
  hex?: string | null;
};

export type CatalogFilters = {
  brands: CatalogOption[];
  models: CatalogOption[];
  fuelTypes: CatalogOption[];
  transmissionTypes: CatalogOption[];
  bodyTypes: CatalogOption[];
  driveTypes: CatalogOption[];
  engineTypes: CatalogOption[];
  conditionTypes: CatalogOption[];
  colors: CatalogOption[];
  governorates: CatalogOption[];
  cities: Array<CatalogOption & { governorateId: string }>;
  categories: Array<CatalogOption & { code: string }>;
};

export type PlateCategory = {
  id: string;
  code: string;
  nameEn: string;
  nameAr?: string | null;
};

export type PlatePrefix = {
  id: string;
  formatCode: string;
  letter: string;
  label?: string | null;
};

export type PlateProvince = {
  id: string;
  code: string;
  nameEn: string;
  nameAr?: string | null;
  plateFormats?: Array<{ code: string; regionCode?: string | null }>;
};

export type CatalogRepository = {
  getFilters(): Promise<CatalogFilters>;
  listPlateCategories(): Promise<PlateCategory[]>;
  listPlatePrefixes(formatCode?: string): Promise<PlatePrefix[]>;
  listPlateProvinces(): Promise<PlateProvince[]>;
};

export function createCatalogRepository(http: HttpClient): CatalogRepository {
  return {
    getFilters: () => http.get<CatalogFilters>('/v1/catalog/filters', false),
    listPlateCategories: () =>
      http.get<PlateCategory[]>('/v1/plates/catalog/categories', false),
    listPlatePrefixes: (formatCode) =>
      http.get<PlatePrefix[]>(
        `/v1/plates/catalog/prefixes${formatCode ? `?formatCode=${encodeURIComponent(formatCode)}` : ''}`,
        false,
      ),
    listPlateProvinces: () =>
      http.get<PlateProvince[]>('/v1/plates/catalog/provinces', false),
  };
}
