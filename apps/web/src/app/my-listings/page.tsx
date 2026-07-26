'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { InfiniteSentinel } from '@/components/InfiniteSentinel';
import { ListingCard } from '@/components/ListingCard';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { STATUS_TABS, type ListingStatus } from '@/features/listings/domain/types';
import { useDomainMutations } from '@/features/listings/hooks/useDomainMutations';
import { isPlateListing } from '@/features/listings/domain/marketplace-path';
import { useMyListings } from '@/features/listings/hooks/useListings';

function domainOf(item: { domain?: 'VEHICLE' | 'PLATE' | null; categoryCode?: string | null }) {
  return isPlateListing(item) ? 'PLATE' : 'VEHICLE';
}

export default function MyListingsPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [tab, setTab] = useState<'ALL' | ListingStatus>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const query = useMyListings(tab);
  const { changeStatus, softDelete } = useDomainMutations();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/my-listings');
  }, [status, router]);

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  const runStatus = async (
    id: string,
    next: ListingStatus,
    domain: 'VEHICLE' | 'PLATE',
  ) => {
    setBusyId(id);
    setActionError(null);
    try {
      await changeStatus.mutateAsync({ id, status: next, domain });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
      throw err;
    } finally {
      setBusyId(null);
    }
  };

  /** API allows ARCHIVED → DRAFT only; republish then DRAFT → PENDING. */
  const republish = async (id: string, current: ListingStatus, domain: 'VEHICLE' | 'PLATE') => {
    setBusyId(id);
    setActionError(null);
    try {
      if (current === 'ARCHIVED') {
        await changeStatus.mutateAsync({ id, status: 'DRAFT', domain });
      }
      if (current === 'ARCHIVED' || current === 'DRAFT' || current === 'REJECTED') {
        await changeStatus.mutateAsync({ id, status: 'PENDING', domain });
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Republish failed');
    } finally {
      setBusyId(null);
    }
  };

  const activate = async (id: string, current: ListingStatus, domain: 'VEHICLE' | 'PLATE') => {
    if (current === 'RESERVED') {
      await runStatus(id, 'ACTIVE', domain);
      return;
    }
    if (current === 'ARCHIVED') {
      await republish(id, current, domain);
    }
  };

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

      {actionError ? (
        <p className="mb-4 rounded-md bg-error/10 px-4 py-3 text-sm text-error">{actionError}</p>
      ) : null}

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
              const busy = busyId === item.id;
              const canEdit = item.status !== 'SOLD' && item.status !== 'ARCHIVED';
              const canPause =
                item.status === 'ACTIVE' ||
                item.status === 'PENDING' ||
                item.status === 'RESERVED';
              const canActivate = item.status === 'RESERVED' || item.status === 'ARCHIVED';
              const canRepublish =
                item.status === 'DRAFT' ||
                item.status === 'REJECTED' ||
                item.status === 'ARCHIVED';

              return (
                <div key={item.id} className="space-y-2">
                  <ListingCard listing={item} />
                  <p className="text-xs font-medium text-ink-secondary">
                    {domain} · Status: {item.status}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {canEdit ? (
                      <Link href={`/my-listings/${item.id}/edit`}>
                        <Button variant="secondary" className="h-9 text-xs" disabled={busy}>
                          Edit
                        </Button>
                      </Link>
                    ) : null}
                    {canPause ? (
                      <Button
                        variant="ghost"
                        className="h-9 text-xs"
                        disabled={busy}
                        onClick={() => void runStatus(item.id, 'ARCHIVED', domain)}
                      >
                        Pause
                      </Button>
                    ) : null}
                    {canActivate ? (
                      <Button
                        variant="secondary"
                        className="h-9 text-xs"
                        disabled={busy}
                        onClick={() =>
                          void activate(item.id, item.status as ListingStatus, domain)
                        }
                      >
                        Activate
                      </Button>
                    ) : null}
                    {canRepublish ? (
                      <Button
                        className="h-9 text-xs"
                        disabled={busy}
                        onClick={() =>
                          void republish(item.id, item.status as ListingStatus, domain)
                        }
                      >
                        Republish
                      </Button>
                    ) : null}
                    {item.status === 'ACTIVE' || item.status === 'RESERVED' ? (
                      <Button
                        variant="secondary"
                        className="h-9 text-xs"
                        disabled={busy}
                        onClick={() => void runStatus(item.id, 'SOLD', domain)}
                      >
                        Mark sold
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      className="h-9 text-xs"
                      disabled={busy}
                      onClick={() =>
                        void softDelete
                          .mutateAsync({ id: item.id, domain })
                          .catch((err: unknown) =>
                            setActionError(
                              err instanceof Error ? err.message : 'Delete failed',
                            ),
                          )
                      }
                    >
                      Delete
                    </Button>
                  </div>
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
