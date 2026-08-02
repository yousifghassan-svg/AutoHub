/**
 * Builds the query string for GET /v1/vehicles/search.
 * Unspecified sort is omitted so the API can default (keyword → relevance).
 */

import type { VehicleSearchQuery } from '../domain/types';

export function buildVehicleSearchApiSort(
  sortBy: VehicleSearchQuery['sortBy'],
  sortOrder: VehicleSearchQuery['sortOrder'],
): Pick<VehicleSearchQuery, 'sortBy' | 'sortOrder'> {
  if (!sortBy) return {};
  return { sortBy, sortOrder: sortOrder ?? 'desc' };
}

export function toVehicleSearchQueryString(params: VehicleSearchQuery): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.pageSize) sp.set('pageSize', String(params.pageSize));
  if (params.keyword) sp.set('keyword', params.keyword);
  if (params.categoryCode) sp.set('categoryCode', params.categoryCode);
  if (params.isFeatured != null) sp.set('isFeatured', String(params.isFeatured));
  if (params.mine) sp.set('mine', 'true');
  if (params.minPrice != null) sp.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) sp.set('maxPrice', String(params.maxPrice));
  if (params.currencyCode) sp.set('currencyCode', params.currencyCode);
  if (params.governorateId) sp.set('governorateId', params.governorateId);
  if (params.cityId) sp.set('cityId', params.cityId);
  if (params.makeId) sp.set('makeId', params.makeId);
  if (params.modelId) sp.set('modelId', params.modelId);
  if (params.bodyTypeId) sp.set('bodyTypeId', params.bodyTypeId);
  if (params.fuelTypeId) sp.set('fuelTypeId', params.fuelTypeId);
  if (params.transmissionTypeId) {
    sp.set('transmissionTypeId', params.transmissionTypeId);
  }
  if (params.driveTypeId) sp.set('driveTypeId', params.driveTypeId);
  if (params.colorId) sp.set('colorId', params.colorId);
  if (params.minYear != null) sp.set('minYear', String(params.minYear));
  if (params.maxYear != null) sp.set('maxYear', String(params.maxYear));
  if (params.minMileage != null) sp.set('minMileage', String(params.minMileage));
  if (params.maxMileage != null) sp.set('maxMileage', String(params.maxMileage));

  const sort = buildVehicleSearchApiSort(params.sortBy, params.sortOrder);
  if (sort.sortBy) {
    sp.set('sortBy', sort.sortBy);
    sp.set('sortOrder', sort.sortOrder ?? 'desc');
  }

  return sp.toString();
}
