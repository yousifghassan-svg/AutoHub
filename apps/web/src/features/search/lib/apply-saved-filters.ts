import type { SearchSort } from '../domain/types';

const YEAR_MIN = 1990;
const YEAR_MAX = new Date().getFullYear() + 1;
const PRICE_MAX = 200_000_000;
const MILEAGE_MAX = 500_000;

export type SearchFilterState = {
  q: string;
  submitted: string;
  categoryCode: string;
  brandId: string;
  modelId: string;
  bodyTypeId: string;
  colorId: string;
  governorateId: string;
  cityId: string;
  fuelTypeId: string;
  transmissionTypeId: string;
  sort: SearchSort;
  price: [number, number];
  year: [number, number];
  mileage: [number, number];
  featuredOnly: boolean;
};

function str(f: Record<string, unknown>, key: string): string {
  const v = f[key];
  return typeof v === 'string' ? v : '';
}

function num(f: Record<string, unknown>, key: string): number | undefined {
  const v = f[key];
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function bool(f: Record<string, unknown>, key: string): boolean {
  const v = f[key];
  return v === true || v === 'true' || v === 1 || v === '1';
}

export function applySavedFilters(f: Record<string, unknown>): Partial<SearchFilterState> {
  const q = str(f, 'q');
  const minPrice = num(f, 'minPrice') ?? 0;
  const maxPrice = num(f, 'maxPrice') ?? PRICE_MAX;
  const minYear = num(f, 'minYear') ?? YEAR_MIN;
  const maxYear = num(f, 'maxYear') ?? YEAR_MAX;
  const minMileage = num(f, 'minMileage') ?? 0;
  const maxMileage = num(f, 'maxMileage') ?? MILEAGE_MAX;
  const sortRaw = str(f, 'sort');

  return {
    q,
    submitted: q,
    categoryCode: str(f, 'categoryCode'),
    brandId: str(f, 'brandId'),
    modelId: str(f, 'modelId'),
    bodyTypeId: str(f, 'bodyTypeId'),
    colorId: str(f, 'colorId'),
    governorateId: str(f, 'governorateId'),
    cityId: str(f, 'cityId'),
    fuelTypeId: str(f, 'fuelTypeId'),
    transmissionTypeId: str(f, 'transmissionTypeId'),
    sort: (sortRaw || 'NEWEST') as SearchSort,
    price: [minPrice, maxPrice < PRICE_MAX ? maxPrice : PRICE_MAX],
    year: [minYear > YEAR_MIN ? minYear : YEAR_MIN, maxYear < YEAR_MAX ? maxYear : YEAR_MAX],
    mileage: [minMileage, maxMileage < MILEAGE_MAX ? maxMileage : MILEAGE_MAX],
    featuredOnly: bool(f, 'featuredOnly'),
  };
}

export { YEAR_MIN, YEAR_MAX, PRICE_MAX, MILEAGE_MAX };
