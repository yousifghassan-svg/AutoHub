'use client';

import { useQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/lib/api/client';
import { createDealersRepository } from '../data/dealers.repository';

function repo() {
  return createDealersRepository(getHttpClient());
}

export function useDealers(query: {
  page?: number;
  pageSize?: number;
  verifiedOnly?: boolean;
} = {}) {
  return useQuery({
    queryKey: ['dealers', query],
    queryFn: () => repo().list({ pageSize: 8, verifiedOnly: true, ...query }),
    staleTime: 60_000,
  });
}

export function useDealerProfile(slug: string) {
  return useQuery({
    queryKey: ['dealer', slug],
    queryFn: () => repo().getBySlug(slug),
    enabled: Boolean(slug),
  });
}
