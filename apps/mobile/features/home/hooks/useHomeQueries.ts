import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getHomeRepository } from '../di';

export const homeKeys = {
  all: ['home'] as const,
  featured: () => [...homeKeys.all, 'featured'] as const,
  latest: () => [...homeKeys.all, 'latest'] as const,
  trending: () => [...homeKeys.all, 'trending'] as const,
  categories: () => [...homeKeys.all, 'categories'] as const,
  recentSearches: () => [...homeKeys.all, 'recentSearches'] as const,
  recentlyViewed: () => [...homeKeys.all, 'recentlyViewed'] as const,
  explore: (categoryCode?: string) => [...homeKeys.all, 'explore', categoryCode ?? 'all'] as const,
  search: (q: string) => [...homeKeys.all, 'search', q] as const,
};

export function useFeaturedListings() {
  const repo = getHomeRepository();
  return useQuery({
    queryKey: homeKeys.featured(),
    queryFn: () => repo.getFeatured(10),
  });
}

export function useLatestListingsInfinite(pageSize = 10) {
  const repo = getHomeRepository();
  return useInfiniteQuery({
    queryKey: homeKeys.latest(),
    queryFn: ({ pageParam }) => repo.getLatest(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
}

export function useTrending() {
  const repo = getHomeRepository();
  return useQuery({
    queryKey: homeKeys.trending(),
    queryFn: () => repo.getTrending(7, 10),
  });
}

export function useCategories() {
  const repo = getHomeRepository();
  return useQuery({
    queryKey: homeKeys.categories(),
    queryFn: () => repo.getCategories(),
  });
}

export function useRecentSearches() {
  const repo = getHomeRepository();
  return useQuery({
    queryKey: homeKeys.recentSearches(),
    queryFn: () => repo.getRecentSearches(20),
  });
}

export function useRecentlyViewed() {
  const repo = getHomeRepository();
  return useQuery({
    queryKey: homeKeys.recentlyViewed(),
    queryFn: () => repo.getRecentlyViewed(),
  });
}

export function useRecordListingView() {
  const repo = getHomeRepository();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repo.recordView.bind(repo),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: homeKeys.recentlyViewed() });
    },
  });
}

export function useExploreListingsInfinite(categoryCode?: string, pageSize = 12) {
  const repo = getHomeRepository();
  return useInfiniteQuery({
    queryKey: homeKeys.explore(categoryCode),
    queryFn: ({ pageParam }) =>
      repo.getListings({
        page: pageParam,
        pageSize,
        categoryCode,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
}

export function useSearchListingsInfinite(keyword: string, pageSize = 12) {
  const repo = getHomeRepository();
  return useInfiniteQuery({
    queryKey: homeKeys.search(keyword),
    queryFn: ({ pageParam }) =>
      repo.getListings({
        page: pageParam,
        pageSize,
        keyword: keyword || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled: keyword.trim().length >= 2,
  });
}

export async function refreshHomeQueries(
  qc: ReturnType<typeof useQueryClient>,
): Promise<void> {
  await Promise.all([
    qc.invalidateQueries({ queryKey: homeKeys.featured() }),
    qc.invalidateQueries({ queryKey: homeKeys.latest() }),
    qc.invalidateQueries({ queryKey: homeKeys.trending() }),
    qc.invalidateQueries({ queryKey: homeKeys.categories() }),
    qc.invalidateQueries({ queryKey: homeKeys.recentSearches() }),
    qc.invalidateQueries({ queryKey: homeKeys.recentlyViewed() }),
  ]);
}
