import { useMutation, useQuery } from '@tanstack/react-query';
import { getListingDetailRepository } from '../di';
import type { ListingDetailModel } from '../domain/types';

export const listingDetailKeys = {
  all: ['listing-detail'] as const,
  detail: (id: string) => [...listingDetailKeys.all, 'detail', id] as const,
  media: (id: string) => [...listingDetailKeys.all, 'media', id] as const,
  similar: (id: string) => [...listingDetailKeys.all, 'similar', id] as const,
};

export function useListingDetail(id: string) {
  const repo = getListingDetailRepository();
  return useQuery({
    queryKey: listingDetailKeys.detail(id),
    queryFn: () => repo.getById(id),
    enabled: Boolean(id),
  });
}

export function useListingMedia(id: string) {
  const repo = getListingDetailRepository();
  return useQuery({
    queryKey: listingDetailKeys.media(id),
    queryFn: () => repo.getMedia(id),
    enabled: Boolean(id),
  });
}

export function useSimilarListings(detail: ListingDetailModel | undefined) {
  const repo = getListingDetailRepository();
  return useQuery({
    queryKey: listingDetailKeys.similar(detail?.id ?? ''),
    queryFn: () => repo.getSimilar(detail!),
    enabled: Boolean(detail?.id),
  });
}

export function useReportListing() {
  const repo = getListingDetailRepository();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      repo.reportListing(id, reason),
  });
}
