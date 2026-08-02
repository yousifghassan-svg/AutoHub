import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { priceRangeForCurrency } from '../../currencies/domain/types';
import { MILEAGE_MAX, YEAR_MAX, YEAR_MIN } from './apply-saved-filters';
import {
  parseVehicleSearchParams,
  patchVehicleSearchState,
  serializeVehicleSearchParams,
  vehicleSearchQueryEqual,
  type VehicleSearchUrlState,
} from './url-search-state';

function roundTrip(state: VehicleSearchUrlState): VehicleSearchUrlState {
  const qs = serializeVehicleSearchParams(state).toString();
  return parseVehicleSearchParams(new URLSearchParams(qs));
}

function emptyFilters(
  overrides: Partial<VehicleSearchUrlState> = {},
): VehicleSearchUrlState {
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
    maxPrice: priceRangeForCurrency('IQD').max,
    minYear: YEAR_MIN,
    maxYear: YEAR_MAX,
    minMileage: 0,
    maxMileage: MILEAGE_MAX,
    featured: false,
    page: 1,
    ...overrides,
  };
}

describe('vehicle search URL state (P4-4)', () => {
  it('round-trips the required searchable parameters', () => {
    const state: VehicleSearchUrlState = {
      q: 'Camry',
      categoryCode: 'CAR',
      brandId: 'brand-toyota',
      modelId: 'model-camry',
      bodyTypeId: 'body-sedan',
      fuelTypeId: 'fuel-petrol',
      transmissionTypeId: 'trans-auto',
      governorateId: 'gov-baghdad',
      cityId: 'city-baghdad',
      currencyCode: 'USD',
      minPrice: 5000,
      maxPrice: 40000,
      minYear: 2018,
      maxYear: 2024,
      minMileage: 1000,
      maxMileage: 80000,
      featured: true,
      sortBy: 'primaryPrice',
      sortOrder: 'asc',
      page: 3,
    };

    const restored = roundTrip(state);
    assert.equal(restored.q, 'Camry');
    assert.equal(restored.categoryCode, 'CAR');
    assert.equal(restored.brandId, 'brand-toyota');
    assert.equal(restored.modelId, 'model-camry');
    assert.equal(restored.governorateId, 'gov-baghdad');
    assert.equal(restored.cityId, 'city-baghdad');
    assert.equal(restored.currencyCode, 'USD');
    assert.equal(restored.minPrice, 5000);
    assert.equal(restored.maxPrice, 40000);
    assert.equal(restored.minYear, 2018);
    assert.equal(restored.maxYear, 2024);
    assert.equal(restored.minMileage, 1000);
    assert.equal(restored.maxMileage, 80000);
    assert.equal(restored.featured, true);
    assert.equal(restored.sortBy, 'primaryPrice');
    assert.equal(restored.sortOrder, 'asc');
    assert.equal(restored.page, 3);
  });

  it('accepts makeId as brandId alias when parsing', () => {
    const parsed = parseVehicleSearchParams(
      new URLSearchParams('makeId=brand-from-make&q=tesla'),
    );
    assert.equal(parsed.brandId, 'brand-from-make');
    assert.equal(parsed.q, 'tesla');
  });

  it('omits unspecified sort/page/currency from the query string', () => {
    const qs = serializeVehicleSearchParams(emptyFilters()).toString();
    assert.equal(qs, '');
  });

  it('treats missing sort params as unspecified (not createdAt)', () => {
    const parsed = parseVehicleSearchParams(new URLSearchParams('q=toyota'));
    assert.equal(parsed.q, 'toyota');
    assert.equal(parsed.sortBy, undefined);
    assert.equal(parsed.sortOrder, undefined);
  });

  it('persists explicit createdAt sort in the query string', () => {
    const qs = serializeVehicleSearchParams(
      emptyFilters({ sortBy: 'createdAt', sortOrder: 'desc' }),
    ).toString();
    const sp = new URLSearchParams(qs);
    assert.equal(sp.get('sortBy'), 'createdAt');
    assert.equal(sp.get('sortOrder'), 'desc');
  });

  it('round-trips explicit relevance sort', () => {
    const restored = roundTrip(
      emptyFilters({ q: 'toyota', sortBy: 'relevance', sortOrder: 'desc' }),
    );
    assert.equal(restored.sortBy, 'relevance');
    assert.equal(restored.sortOrder, 'desc');
  });

  it('resets page when filters change unless page is patched', () => {
    const current = emptyFilters({ q: 'x', page: 4 });
    const filtered = patchVehicleSearchState(current, { brandId: 'b1' });
    assert.equal(filtered.page, 1);
    const paged = patchVehicleSearchState(
      current,
      { page: 5 },
      { resetPage: false },
    );
    assert.equal(paged.page, 5);
  });

  it('compares query strings independent of param order', () => {
    assert.equal(
      vehicleSearchQueryEqual('q=a&brandId=b', 'brandId=b&q=a'),
      true,
    );
    assert.equal(vehicleSearchQueryEqual('q=a', 'q=b'), false);
  });
});
