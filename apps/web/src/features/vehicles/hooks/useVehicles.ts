'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import { createVehiclesRepository } from '../data/vehicles.repository';
import type { VehicleListQuery, VehicleSearchQuery } from '../domain/types';

function repo() {
  return createVehiclesRepository(getHttpClient());
}

export function useVehiclesPage(query: VehicleListQuery, enabled = true) {
  return useQuery({
    queryKey: ['vehicles', query],
    queryFn: () => repo().list({ pageSize: 12, ...query, page: query.page ?? 1 }),
    enabled,
  });
}

export function useVehicleSearchInfinite(
  query: Omit<VehicleSearchQuery, 'page'>,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ['vehicles-search', query],
    queryFn: ({ pageParam }) =>
      repo().search({ ...query, page: pageParam, pageSize: query.pageSize ?? 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled,
  });
}

export function useVehicleDetail(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => repo().getById(id),
    enabled: Boolean(id),
  });
}
