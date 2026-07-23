import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getMyListingsRepository } from '../di';
import type { EditListingInput, ListingStatus, ManagedListing, StatusTab } from '../domain/types';

export const myListingsKeys = {
  all: ['my-listings'] as const,
  tab: (tab: StatusTab) => [...myListingsKeys.all, tab] as const,
};

export function useMyListingsInfinite(tab: StatusTab, pageSize = 20) {
  const repo = getMyListingsRepository();
  return useInfiniteQuery({
    queryKey: myListingsKeys.tab(tab),
    queryFn: ({ pageParam }) => repo.listMine({ tab, page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  return qc.invalidateQueries({ queryKey: myListingsKeys.all });
}

export function useChangeListingStatus() {
  const repo = getMyListingsRepository();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) =>
      repo.changeStatus(id, status),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useSoftDeleteListing() {
  const repo = getMyListingsRepository();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repo.softDelete(id),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateListing() {
  const repo = getMyListingsRepository();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EditListingInput }) =>
      repo.update(id, input),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDuplicateListing() {
  const repo = getMyListingsRepository();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listing: ManagedListing) => repo.duplicate(listing),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useRenewListing() {
  const repo = getMyListingsRepository();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listing: ManagedListing) => repo.renew(listing),
    onSuccess: () => invalidateAll(qc),
  });
}
