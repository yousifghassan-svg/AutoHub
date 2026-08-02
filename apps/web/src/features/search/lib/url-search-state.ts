/**
 * P4-4 — Vehicle search URL state (single source of truth).
 * Pure parse/serialize helpers; no router side effects here.
 */

import type { ListingCategoryCode } from '../../listings/domain/types';
import { priceRangeForCurrency } from '../../currencies/domain/types';
import type { VehicleSortBy, VehicleSortOrder } from '../../vehicles/domain/types';
import { MILEAGE_MAX, YEAR_MAX, YEAR_MIN } from './apply-saved-filters';

export type VehicleSearchUrlState = {
  q: string;
  categoryCode: ListingCategoryCode | '';
  brandId: string;
  modelId: string;
  bodyTypeId: string;
  fuelTypeId: string;
  transmissionTypeId: string;
  governorateId: string;
  cityId: string;
  currencyCode: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  minMileage: number;
  maxMileage: number;
  featured: boolean;
  /**
   * Explicit sort only. `undefined` means the user has not chosen a sort —
   * the client omits sort params so the API can apply keyword → relevance.
   */
  sortBy?: VehicleSortBy;
  sortOrder?: VehicleSortOrder;
  /** 1-based result page (infinite scroll loads 1..page). */
  page: number;
};

function num(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function clampPage(value: number | undefined): number {
  if (value == null || !Number.isFinite(value) || value < 1) return 1;
  return Math.floor(value);
}

function parseSortBy(raw: string | null): VehicleSortBy | undefined {
  if (
    raw === 'primaryPrice' ||
    raw === 'publishedAt' ||
    raw === 'relevance' ||
    raw === 'createdAt'
  ) {
    return raw;
  }
  return undefined;
}

function parseSortOrder(raw: string | null): VehicleSortOrder | undefined {
  if (raw === 'asc' || raw === 'desc') return raw;
  return undefined;
}

export function parseVehicleSearchParams(
  params: URLSearchParams,
): VehicleSearchUrlState {
  const currencyCode = params.get('currency') ?? 'IQD';
  const bounds = priceRangeForCurrency(currencyCode);
  const sortBy = parseSortBy(params.get('sortBy'));
  const sortOrder = sortBy
    ? (parseSortOrder(params.get('sortOrder')) ?? 'desc')
    : undefined;

  return {
    q: params.get('q') ?? '',
    categoryCode: (params.get('category') as ListingCategoryCode | null) ?? '',
    brandId: params.get('brandId') ?? params.get('makeId') ?? '',
    modelId: params.get('modelId') ?? '',
    bodyTypeId: params.get('bodyTypeId') ?? '',
    fuelTypeId: params.get('fuelTypeId') ?? '',
    transmissionTypeId: params.get('transmissionTypeId') ?? '',
    governorateId: params.get('governorateId') ?? '',
    cityId: params.get('cityId') ?? '',
    currencyCode,
    minPrice: num(params, 'minPrice') ?? 0,
    maxPrice: num(params, 'maxPrice') ?? bounds.max,
    minYear: num(params, 'minYear') ?? YEAR_MIN,
    maxYear: num(params, 'maxYear') ?? YEAR_MAX,
    minMileage: num(params, 'minMileage') ?? 0,
    maxMileage: num(params, 'maxMileage') ?? MILEAGE_MAX,
    featured: params.get('featured') === '1',
    sortBy,
    sortOrder,
    page: clampPage(num(params, 'page')),
  };
}

export function serializeVehicleSearchParams(
  state: VehicleSearchUrlState,
): URLSearchParams {
  const bounds = priceRangeForCurrency(state.currencyCode);
  const sp = new URLSearchParams();

  const set = (key: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === '') return;
    sp.set(key, String(value));
  };

  set('q', state.q.trim() || undefined);
  set('category', state.categoryCode || undefined);
  set('brandId', state.brandId || undefined);
  set('modelId', state.modelId || undefined);
  set('bodyTypeId', state.bodyTypeId || undefined);
  set('fuelTypeId', state.fuelTypeId || undefined);
  set('transmissionTypeId', state.transmissionTypeId || undefined);
  set('governorateId', state.governorateId || undefined);
  set('cityId', state.cityId || undefined);

  if (state.currencyCode && state.currencyCode !== 'IQD') {
    set('currency', state.currencyCode);
  }

  if (state.minPrice > 0) set('minPrice', state.minPrice);
  if (state.maxPrice < bounds.max) set('maxPrice', state.maxPrice);
  if (state.minYear > YEAR_MIN) set('minYear', state.minYear);
  if (state.maxYear < YEAR_MAX) set('maxYear', state.maxYear);
  if (state.minMileage > 0) set('minMileage', state.minMileage);
  if (state.maxMileage < MILEAGE_MAX) set('maxMileage', state.maxMileage);
  if (state.featured) set('featured', '1');

  // Persist any explicit sort (including createdAt/desc) so it stays distinct
  // from "unspecified" (omitted → API keyword relevance default).
  if (state.sortBy) {
    set('sortBy', state.sortBy);
    set('sortOrder', state.sortOrder ?? 'desc');
  }
  if (state.page > 1) set('page', state.page);

  return sp;
}

/** Stable comparison that ignores param insertion order. */
export function vehicleSearchQueryEqual(a: string, b: string): boolean {
  const pa = new URLSearchParams(a);
  const pb = new URLSearchParams(b);
  const keys = new Set([...pa.keys(), ...pb.keys()]);
  for (const key of keys) {
    if ((pa.get(key) ?? '') !== (pb.get(key) ?? '')) return false;
  }
  return true;
}

export function patchVehicleSearchState(
  current: VehicleSearchUrlState,
  patch: Partial<VehicleSearchUrlState>,
  options?: { resetPage?: boolean },
): VehicleSearchUrlState {
  const next = { ...current, ...patch };
  const filterKeysChanged = Object.keys(patch).some((k) => k !== 'page');
  if (options?.resetPage !== false && filterKeysChanged && !('page' in patch)) {
    next.page = 1;
  }
  if (patch.currencyCode && patch.currencyCode !== current.currencyCode) {
    const bounds = priceRangeForCurrency(patch.currencyCode);
    if (patch.minPrice === undefined) next.minPrice = 0;
    if (patch.maxPrice === undefined) next.maxPrice = bounds.max;
  }
  next.page = clampPage(next.page);
  return next;
}
