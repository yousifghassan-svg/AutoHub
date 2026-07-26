'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import { createListingsRepository } from '../data/listings.repository';
import { createPlatesRepository } from '@/features/plates/data/plates.repository';
import { createVehiclesRepository } from '@/features/vehicles/data/vehicles.repository';
import type { ListingStatus } from '../domain/types';

function vehicles() {
  return createVehiclesRepository(getHttpClient());
}

function plates() {
  return createPlatesRepository(getHttpClient());
}

function listings() {
  return createListingsRepository(getHttpClient());
}

/**
 * Domain-aware create/status/delete. Media stays on shared /v1/listings/:id/media.
 */
export function useDomainMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['listings-infinite'] });
    void qc.invalidateQueries({ queryKey: ['vehicles'] });
    void qc.invalidateQueries({ queryKey: ['plates'] });
  };

  return {
    createVehicle: useMutation({
      mutationFn: (body: Record<string, unknown>) => vehicles().create(body),
      onSuccess: invalidate,
    }),
    createPlate: useMutation({
      mutationFn: (body: Record<string, unknown>) => plates().create(body),
      onSuccess: invalidate,
    }),
    changeStatus: useMutation({
      mutationFn: (input: {
        id: string;
        status: ListingStatus;
        domain: 'VEHICLE' | 'PLATE';
      }) =>
        input.domain === 'PLATE'
          ? plates().changeStatus(input.id, input.status)
          : vehicles().changeStatus(input.id, input.status),
      onSuccess: invalidate,
    }),
    softDelete: useMutation({
      mutationFn: (input: { id: string; domain: 'VEHICLE' | 'PLATE' }) =>
        input.domain === 'PLATE'
          ? plates().softDelete(input.id)
          : vehicles().softDelete(input.id),
      onSuccess: invalidate,
    }),
    addMedia: useMutation({
      mutationFn: (input: {
        listingId: string;
        mediaAssetId: string;
        mediaType: string;
        sortOrder?: number;
      }) =>
        listings().addMedia(input.listingId, {
          mediaAssetId: input.mediaAssetId,
          mediaType: input.mediaType,
          sortOrder: input.sortOrder,
        }),
      onSuccess: invalidate,
    }),
  };
}
