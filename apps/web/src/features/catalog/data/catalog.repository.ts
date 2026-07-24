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
      return http.get<CatalogFilters>('/v1/catalog/filters', false);
    },
  };
}
