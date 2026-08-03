'use client';

import { useQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import { createVehiclesRepository } from '@/features/vehicles/data/vehicles.repository';
import type { VehicleListQuery, VehicleSearchQuery } from '@/features/vehicles/domain/types';

function repo() {
  return createVehiclesRepository(getHttpClient());
}

/** Homepage list fetch — existing vehicles list API only. */
export function useHomeVehicleList(query: VehicleListQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['home', 'vehicles-list', query],
    queryFn: () => repo().list({ page: 1, pageSize: 6, ...query }),
    enabled,
    staleTime: 60_000,
  });
}

/** Homepage search fetch — existing vehicles search API only. */
export function useHomeVehicleSearch(query: VehicleSearchQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['home', 'vehicles-search', query],
    queryFn: () => repo().search({ page: 1, pageSize: 6, ...query }),
    enabled,
    staleTime: 60_000,
  });
}
