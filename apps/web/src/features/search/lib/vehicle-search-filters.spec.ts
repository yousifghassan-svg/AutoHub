import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { priceRangeForCurrency } from '../../currencies/domain/types';
import { MILEAGE_MAX, YEAR_MAX, YEAR_MIN } from './apply-saved-filters';
import type { VehicleSearchUrlState } from './url-search-state';
import {
  buildActiveFilterChips,
  clearedVehicleSearchFilters,
  hasActiveVehicleFilters,
} from './vehicle-search-filters';

function baseState(
  overrides: Partial<VehicleSearchUrlState> = {},
): VehicleSearchUrlState {
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
    ...overrides,
  };
}

describe('vehicle search filter UX helpers (P4-5)', () => {
  it('reports inactive when defaults only', () => {
    assert.equal(hasActiveVehicleFilters(baseState()), false);
  });

  it('reports active for keyword, category, ranges, and featured', () => {
    assert.equal(hasActiveVehicleFilters(baseState({ q: 'Toyota' })), true);
    assert.equal(
      hasActiveVehicleFilters(baseState({ categoryCode: 'CAR' })),
      true,
    );
    assert.equal(hasActiveVehicleFilters(baseState({ minPrice: 1000 })), true);
    assert.equal(hasActiveVehicleFilters(baseState({ featured: true })), true);
  });

  it('cleared filters reset to defaults and page 1', () => {
    const cleared = clearedVehicleSearchFilters();
    assert.equal(cleared.q, '');
    assert.equal(cleared.categoryCode, '');
    assert.equal(cleared.brandId, '');
    assert.equal(cleared.currencyCode, 'IQD');
    assert.equal(cleared.minPrice, 0);
    assert.equal(cleared.maxPrice, priceRangeForCurrency('IQD').max);
    assert.equal(cleared.minYear, YEAR_MIN);
    assert.equal(cleared.maxYear, YEAR_MAX);
    assert.equal(cleared.featured, false);
    assert.equal(cleared.page, 1);
  });

  it('builds chips with clear patches that remove only that filter', () => {
    const state = baseState({
      q: 'Camry',
      categoryCode: 'CAR',
      brandId: 'b1',
      modelId: 'm1',
      featured: true,
      minYear: 2015,
    });
    const chips = buildActiveFilterChips(state, {
      categoryLabel: 'Cars',
      brandName: 'Toyota',
      modelName: 'Camry',
    });
    const ids = chips.map((c) => c.id);
    assert.deepEqual(ids, ['q', 'category', 'brand', 'model', 'year', 'featured']);

    const brand = chips.find((c) => c.id === 'brand')!;
    assert.equal(brand.label, 'Toyota');
    assert.equal(brand.clear.brandId, '');
    assert.equal(brand.clear.modelId, '');

    const year = chips.find((c) => c.id === 'year')!;
    assert.equal(year.clear.minYear, YEAR_MIN);
    assert.equal(year.clear.maxYear, YEAR_MAX);
  });
});
