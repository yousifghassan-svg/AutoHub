'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import { createPlatesRepository, type PlateListQuery } from '../data/plates.repository';

function repo() {
  return createPlatesRepository(getHttpClient());
}

export function usePlatesPage(query: PlateListQuery, enabled = true) {
  return useQuery({
    queryKey: ['plates', query],
    queryFn: () => repo().list({ pageSize: 12, ...query, page: query.page ?? 1 }),
    enabled,
  });
}

export function usePlateSearchInfinite(
  query: Omit<PlateListQuery, 'page'>,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ['plates-search', query],
    queryFn: ({ pageParam }) =>
      repo().search({ ...query, page: pageParam, pageSize: query.pageSize ?? 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled,
  });
}

export function usePlateDetail(id: string) {
  return useQuery({
    queryKey: ['plate', id],
    queryFn: () => repo().getById(id),
    enabled: Boolean(id),
  });
}
