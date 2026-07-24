'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import { createListingsRepository, type ListQuery } from '../data/listings.repository';
import type { ListingStatus } from '../domain/types';

function repo() {
  return createListingsRepository(getHttpClient());
}

export function useListingsPage(query: ListQuery, enabled = true) {
  return useQuery({
    queryKey: ['listings', query],
    queryFn: () => repo().list({ pageSize: 12, ...query, page: query.page ?? 1 }),
    enabled,
  });
}

export function useListingsInfinite(query: Omit<ListQuery, 'page'>, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['listings-infinite', query],
    queryFn: ({ pageParam }) =>
      repo().list({ ...query, page: pageParam, pageSize: query.pageSize ?? 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled,
  });
}

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => repo().getById(id),
    enabled: Boolean(id),
  });
}

export function useMyListings(status: 'ALL' | ListingStatus) {
  return useListingsInfinite(
    {
      mine: true,
      status: status === 'ALL' ? undefined : status,
      pageSize: 20,
    },
    true,
  );
}

export function useListingMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['listings-infinite'] });

  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => repo().create(body),
      onSuccess: invalidate,
    }),
    changeStatus: useMutation({
      mutationFn: (input: { id: string; status: ListingStatus }) =>
        repo().changeStatus(input.id, input.status),
      onSuccess: invalidate,
    }),
    addMedia: useMutation({
      mutationFn: (input: {
        listingId: string;
        mediaAssetId: string;
        mediaType: string;
        sortOrder?: number;
      }) =>
        repo().addMedia(input.listingId, {
          mediaAssetId: input.mediaAssetId,
          mediaType: input.mediaType,
          sortOrder: input.sortOrder,
        }),
      onSuccess: invalidate,
    }),
    reorderMedia: useMutation({
      mutationFn: (input: { listingId: string; orderedIds: string[] }) =>
        repo().reorderMedia(input.listingId, input.orderedIds),
      onSuccess: invalidate,
    }),
    softDelete: useMutation({
      mutationFn: (id: string) => repo().softDelete(id),
      onSuccess: invalidate,
    }),
  };
}
