/**
 * P4-5 — Pure helpers for vehicle search filter UX (chips / clear).
 * Does not change URL serialization; callers write via existing URL hook.
 */

import { priceRangeForCurrency } from '../../currencies/domain/types';
import type { VehicleSearchUrlState } from './url-search-state';
import { MILEAGE_MAX, YEAR_MAX, YEAR_MIN } from './apply-saved-filters';

export type ActiveFilterChip = {
  id: string;
  label: string;
  /** Partial state patch that removes this chip. */
  clear: Partial<VehicleSearchUrlState>;
};

export type FilterLabelLookup = {
  brandName?: string;
  modelName?: string;
  bodyName?: string;
  fuelName?: string;
  transmissionName?: string;
  governorateName?: string;
  cityName?: string;
  categoryLabel?: string;
};

export function hasActiveVehicleFilters(state: VehicleSearchUrlState): boolean {
  const bounds = priceRangeForCurrency(state.currencyCode);
  return Boolean(
    state.q.trim() ||
      state.categoryCode ||
      state.brandId ||
      state.modelId ||
      state.bodyTypeId ||
      state.fuelTypeId ||
      state.transmissionTypeId ||
      state.governorateId ||
      state.cityId ||
      state.featured ||
      state.currencyCode !== 'IQD' ||
      state.minPrice > 0 ||
      state.maxPrice < bounds.max ||
      state.minYear > YEAR_MIN ||
      state.maxYear < YEAR_MAX ||
      state.minMileage > 0 ||
      state.maxMileage < MILEAGE_MAX,
  );
}

export function clearedVehicleSearchFilters(): Partial<VehicleSearchUrlState> {
  const bounds = priceRangeForCurrency('IQD');
  return {
    q: '',
    categoryCode: '',
    brandId: '',
    modelId: '',
    bodyTypeId: '',
    fuelTypeId: '',
    transmissionTypeId: '',
    governorateId: '',
    cityId: '',
    currencyCode: 'IQD',
    minPrice: 0,
    maxPrice: bounds.max,
    minYear: YEAR_MIN,
    maxYear: YEAR_MAX,
    minMileage: 0,
    maxMileage: MILEAGE_MAX,
    featured: false,
    page: 1,
  };
}

export function buildActiveFilterChips(
  state: VehicleSearchUrlState,
  labels: FilterLabelLookup = {},
): ActiveFilterChip[] {
  const bounds = priceRangeForCurrency(state.currencyCode);
  const chips: ActiveFilterChip[] = [];

  if (state.q.trim()) {
    chips.push({
      id: 'q',
      label: `“${state.q.trim()}”`,
      clear: { q: '' },
    });
  }
  if (state.categoryCode) {
    chips.push({
      id: 'category',
      label: labels.categoryLabel ?? state.categoryCode,
      clear: { categoryCode: '' },
    });
  }
  if (state.brandId) {
    chips.push({
      id: 'brand',
      label: labels.brandName ?? 'Brand',
      clear: { brandId: '', modelId: '' },
    });
  }
  if (state.modelId) {
    chips.push({
      id: 'model',
      label: labels.modelName ?? 'Model',
      clear: { modelId: '' },
    });
  }
  if (state.bodyTypeId) {
    chips.push({
      id: 'body',
      label: labels.bodyName ?? 'Body',
      clear: { bodyTypeId: '' },
    });
  }
  if (state.transmissionTypeId) {
    chips.push({
      id: 'transmission',
      label: labels.transmissionName ?? 'Transmission',
      clear: { transmissionTypeId: '' },
    });
  }
  if (state.fuelTypeId) {
    chips.push({
      id: 'fuel',
      label: labels.fuelName ?? 'Fuel',
      clear: { fuelTypeId: '' },
    });
  }
  if (state.governorateId) {
    chips.push({
      id: 'governorate',
      label: labels.governorateName ?? 'Governorate',
      clear: { governorateId: '', cityId: '' },
    });
  }
  if (state.cityId) {
    chips.push({
      id: 'city',
      label: labels.cityName ?? 'City',
      clear: { cityId: '' },
    });
  }
  if (state.currencyCode !== 'IQD') {
    chips.push({
      id: 'currency',
      label: state.currencyCode,
      clear: {
        currencyCode: 'IQD',
        minPrice: 0,
        maxPrice: priceRangeForCurrency('IQD').max,
      },
    });
  }
  if (state.minPrice > 0 || state.maxPrice < bounds.max) {
    chips.push({
      id: 'price',
      label: `${state.minPrice.toLocaleString()}–${state.maxPrice.toLocaleString()} ${state.currencyCode}`,
      clear: { minPrice: 0, maxPrice: bounds.max },
    });
  }
  if (state.minYear > YEAR_MIN || state.maxYear < YEAR_MAX) {
    chips.push({
      id: 'year',
      label: `${state.minYear}–${state.maxYear}`,
      clear: { minYear: YEAR_MIN, maxYear: YEAR_MAX },
    });
  }
  if (state.minMileage > 0 || state.maxMileage < MILEAGE_MAX) {
    chips.push({
      id: 'mileage',
      label: `${state.minMileage.toLocaleString()}–${state.maxMileage.toLocaleString()} km`,
      clear: { minMileage: 0, maxMileage: MILEAGE_MAX },
    });
  }
  if (state.featured) {
    chips.push({
      id: 'featured',
      label: 'Featured',
      clear: { featured: false },
    });
  }

  return chips;
}
