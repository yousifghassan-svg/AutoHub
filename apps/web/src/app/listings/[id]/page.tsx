'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EmptyState, Skeleton } from '@/components/ui';
import { createListingsRepository } from '@/features/listings/data/listings.repository';
import { marketplaceDetailPath } from '@/features/listings/domain/marketplace-path';
import { getHttpClient } from '@/lib/api/client';

/**
 * Legacy compatibility route — redirects to /vehicles/:id or /plates/:id.
 */
export default function LegacyListingRedirectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void createListingsRepository(getHttpClient())
      .getById(id)
      .then((listing) => {
        if (!cancelled) router.replace(marketplaceDetailPath(listing));
      })
      .catch(() => {
        if (!cancelled) router.replace('/vehicles');
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (!id) {
    return (
      <div className="page-container py-16">
        <EmptyState title="Listing not found" description="Missing listing id." />
      </div>
    );
  }

  return (
    <div className="page-container py-16">
      <Skeleton className="mx-auto h-48 max-w-xl" />
    </div>
  );
}
