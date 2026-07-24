'use client';

import { useQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import type { CatalogFilters } from '../domain/types';

export function useCatalogFilters() {
  return useQuery({
    queryKey: ['catalog', 'filters'],
    queryFn: () => getHttpClient().get<CatalogFilters>('/v1/catalog/filters', false),
    staleTime: 5 * 60_000,
  });
}
