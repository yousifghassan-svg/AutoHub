'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import { useAuth } from '@/features/auth/AuthProvider';
import { createCatalogRepository } from '@/features/catalog/data/catalog.repository';
import { createSearchRepository } from '../data/search.repository';
import type { MarketplaceSearchQuery } from '../domain/types';

function searchRepo() {
  return createSearchRepository(getHttpClient());
}

function catalogRepo() {
  return createCatalogRepository(getHttpClient());
}

export function useCatalogFilters() {
  return useQuery({
    queryKey: ['catalog', 'filters'],
    queryFn: () => catalogRepo().filters(),
    staleTime: 5 * 60_000,
  });
}

export function useTrending(days = 30, limit = 8) {
  return useQuery({
    queryKey: ['search', 'trending', days, limit],
    queryFn: () => searchRepo().trending(days, limit),
    staleTime: 60_000,
  });
}

export function useMarketplaceSearchInfinite(
  query: Omit<MarketplaceSearchQuery, 'page'>,
  enabled = true,
) {
  const { status } = useAuth();
  const auth = status === 'authenticated';
  return useInfiniteQuery({
    queryKey: ['marketplace-search', query, auth],
    queryFn: ({ pageParam }) =>
      searchRepo().search(
        { ...query, page: pageParam, pageSize: query.pageSize ?? 12 },
        auth,
      ),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled,
  });
}

export function useSearchFacets(
  query: Omit<MarketplaceSearchQuery, 'page' | 'pageSize' | 'sort'>,
  enabled = true,
) {
  return useQuery({
    queryKey: ['marketplace-facets', query],
    queryFn: () => searchRepo().facets(query),
    enabled,
    staleTime: 30_000,
  });
}

export function useSavedSearches(enabled = false) {
  return useQuery({
    queryKey: ['search', 'saved'],
    queryFn: () => searchRepo().listSaved(),
    enabled,
  });
}

export function useRecentSearches(enabled = false) {
  return useQuery({
    queryKey: ['search', 'recent'],
    queryFn: () => searchRepo().recent(12),
    enabled,
    staleTime: 30_000,
  });
}

export function useSavedSearchMutations() {
  const qc = useQueryClient();
  return {
    save: useMutation({
      mutationFn: (body: {
        name?: string;
        query?: string;
        filters: Record<string, unknown>;
        sort?: string;
      }) => searchRepo().save(body),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ['search', 'saved'] }),
    }),
    remove: useMutation({
      mutationFn: (id: string) => searchRepo().deleteSaved(id),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ['search', 'saved'] }),
    }),
  };
}

export function useSearchSuggestions(q: string, enabled = true) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ['search', 'suggestions', trimmed],
    queryFn: () => searchRepo().suggestions(trimmed),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30_000,
  });
}
