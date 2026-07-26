import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getPlatesRepository } from '../di';
import type { PlateListQuery } from '../data/plates.repository';

export const plateKeys = {
  all: ['plates'] as const,
  featured: () => [...plateKeys.all, 'featured'] as const,
  newest: () => [...plateKeys.all, 'newest'] as const,
  search: (q: PlateListQuery) => [...plateKeys.all, 'search', q] as const,
  mine: () => [...plateKeys.all, 'mine'] as const,
  detail: (id: string) => [...plateKeys.all, 'detail', id] as const,
};

export function useFeaturedPlates(pageSize = 10) {
  return useQuery({
    queryKey: plateKeys.featured(),
    queryFn: () => getPlatesRepository().featured(pageSize),
  });
}

export function useNewestPlates(pageSize = 10) {
  return useQuery({
    queryKey: plateKeys.newest(),
    queryFn: () => getPlatesRepository().newest(pageSize),
  });
}

export function usePlateSearchInfinite(query: PlateListQuery, enabled = true) {
  return useInfiniteQuery({
    queryKey: plateKeys.search(query),
    queryFn: ({ pageParam }) =>
      getPlatesRepository().search({ ...query, page: pageParam, pageSize: query.pageSize ?? 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled,
  });
}

export function useMyPlatesInfinite() {
  return useInfiniteQuery({
    queryKey: plateKeys.mine(),
    queryFn: ({ pageParam }) =>
      getPlatesRepository().list({ page: pageParam, pageSize: 20, mine: true }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
}

export function usePlateDetail(id: string) {
  return useQuery({
    queryKey: plateKeys.detail(id),
    queryFn: () => getPlatesRepository().getById(id),
    enabled: Boolean(id),
  });
}
