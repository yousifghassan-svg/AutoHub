import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getVehiclesRepository } from '../di';
import type { VehicleListQuery } from '../data/vehicles.repository';

export const vehicleKeys = {
  all: ['vehicles'] as const,
  featured: () => [...vehicleKeys.all, 'featured'] as const,
  newest: () => [...vehicleKeys.all, 'newest'] as const,
  search: (q: VehicleListQuery) => [...vehicleKeys.all, 'search', q] as const,
  mine: () => [...vehicleKeys.all, 'mine'] as const,
  detail: (id: string) => [...vehicleKeys.all, 'detail', id] as const,
};

export function useFeaturedVehicles(pageSize = 10) {
  return useQuery({
    queryKey: vehicleKeys.featured(),
    queryFn: () => getVehiclesRepository().featured(pageSize),
  });
}

export function useNewestVehicles(pageSize = 10) {
  return useQuery({
    queryKey: vehicleKeys.newest(),
    queryFn: () => getVehiclesRepository().newest(pageSize),
  });
}

export function useVehicleSearchInfinite(query: VehicleListQuery, enabled = true) {
  return useInfiniteQuery({
    queryKey: vehicleKeys.search(query),
    queryFn: ({ pageParam }) =>
      getVehiclesRepository().search({ ...query, page: pageParam, pageSize: query.pageSize ?? 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled,
  });
}

export function useMyVehiclesInfinite() {
  return useInfiniteQuery({
    queryKey: vehicleKeys.mine(),
    queryFn: ({ pageParam }) =>
      getVehiclesRepository().list({ page: pageParam, pageSize: 20, mine: true }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
}

export function useVehicleDetail(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => getVehiclesRepository().getById(id),
    enabled: Boolean(id),
  });
}
