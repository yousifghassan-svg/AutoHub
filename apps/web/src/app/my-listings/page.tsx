'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { InfiniteSentinel } from '@/components/InfiniteSentinel';
import { ListingCard } from '@/components/ListingCard';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { STATUS_TABS, type ListingStatus } from '@/features/listings/domain/types';
import { isPlateListing } from '@/features/listings/domain/marketplace-path';
import { useMyListings } from '@/features/listings/hooks/useListings';
import { ListingOwnerActions, ListingStatusBadge } from '@/features/listings/shared';

function domainOf(item: { domain?: 'VEHICLE' | 'PLATE' | null; categoryCode?: string | null }) {
  return isPlateListing(item) ? 'PLATE' : 'VEHICLE';
}

export default function MyListingsPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [tab, setTab] = useState<'ALL' | ListingStatus>('ALL');
  const query = useMyListings(tab);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/my-listings');
  }, [status, router]);

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  return (
    <div className="page-container py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">My listings</h1>
          <p className="mt-1 text-ink-secondary">
            Edit, pause, activate, republish, or archive your listings.
          </p>
        </div>
        <Link href="/sell">
          <Button>Create listing</Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              tab === t.id ? 'bg-brand text-white' : 'bg-surface-muted text-ink-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          title="Couldn’t load your listings"
          description={query.error instanceof Error ? query.error.message : 'Try again'}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No listings here"
          description="Create a listing or switch status tabs."
          action={
            <Link href="/sell">
              <Button>Sell</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const domain = domainOf(item);
              return (
                <div key={item.id} className="space-y-2">
                  <ListingCard listing={item} />
                  <ListingStatusBadge status={item.status} />
                  <p className="text-xs font-medium text-ink-secondary">{domain}</p>
                  <ListingOwnerActions
                    listingId={item.id}
                    status={item.status}
                    domain={domain}
                    surface="manage"
                  />
                </div>
              );
            })}
          </div>
          <InfiniteSentinel
            disabled={!query.hasNextPage || query.isFetchingNextPage}
            onVisible={() => {
              if (query.hasNextPage) void query.fetchNextPage();
            }}
          />
        </>
      )}
    </div>
  );
}
