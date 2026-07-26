import { useQuery } from '@tanstack/react-query';
import { getCatalogRepository } from '../di';

export function useCatalogFilters() {
  return useQuery({
    queryKey: ['catalog', 'filters'],
    queryFn: () => getCatalogRepository().getFilters(),
    staleTime: 5 * 60_000,
  });
}

export function usePlateCategories() {
  return useQuery({
    queryKey: ['catalog', 'plate-categories'],
    queryFn: () => getCatalogRepository().listPlateCategories(),
    staleTime: 5 * 60_000,
  });
}

export function usePlatePrefixes(formatCode?: string) {
  return useQuery({
    queryKey: ['catalog', 'plate-prefixes', formatCode ?? 'all'],
    queryFn: () => getCatalogRepository().listPlatePrefixes(formatCode),
    staleTime: 5 * 60_000,
  });
}

export function usePlateProvinces() {
  return useQuery({
    queryKey: ['catalog', 'plate-provinces'],
    queryFn: () => getCatalogRepository().listPlateProvinces(),
    staleTime: 5 * 60_000,
  });
}
