'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { InfiniteSentinel } from '@/components/InfiniteSentinel';
import { Button, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { ManagedListingCard } from '@/features/listings/components/ManagedListingCard';
import { isPlateListing } from '@/features/listings/domain/marketplace-path';
import {
  MANAGE_SORT_OPTIONS,
  MANAGE_STATUS_TABS,
  type ListingStatus,
} from '@/features/listings/domain/types';
import { useMyListings } from '@/features/listings/hooks/useListings';

function domainOf(item: {
  domain?: 'VEHICLE' | 'PLATE' | null;
  categoryCode?: string | null;
}) {
  return isPlateListing(item) ? 'PLATE' : 'VEHICLE';
}

function emptyCopy(tab: 'ALL' | ListingStatus): {
  title: string;
  description: string;
} {
  switch (tab) {
    case 'DRAFT':
      return {
        title: 'No drafts yet',
        description: 'Start a listing and save it anytime — it will show up here.',
      };
    case 'PENDING':
      return {
        title: 'Nothing in review',
        description: 'Listings you send for review will appear in this group.',
      };
    case 'ACTIVE':
      return {
        title: 'No active listings',
        description: 'When a listing goes live, you’ll manage it from here.',
      };
    case 'REJECTED':
      return {
        title: 'No rejected listings',
        description: 'If a listing needs changes, it will land in this group.',
      };
    case 'SOLD':
      return {
        title: 'No sold listings',
        description: 'Mark a listing sold when the deal is done.',
      };
    case 'ARCHIVED':
      return {
        title: 'No archived listings',
        description: 'Archived listings stay out of browse until you republish.',
      };
    default:
      return {
        title: 'No listings yet',
        description: 'Create your first listing to start selling on AutoHub.',
      };
  }
}

export default function MyListingsPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [tab, setTab] = useState<'ALL' | ListingStatus>('ALL');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [sortId, setSortId] = useState(MANAGE_SORT_OPTIONS[0]!.id);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const sort =
    MANAGE_SORT_OPTIONS.find((o) => o.id === sortId) ?? MANAGE_SORT_OPTIONS[0]!;

  const query = useMyListings({
    status: tab,
    keyword: debouncedKeyword || undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?next=/my-listings');
    }
  }, [status, router]);

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  const empty = emptyCopy(tab);

  return (
    <div className="page-container py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Seller dashboard
          </p>
          <h1 className="section-title mt-1">My listings</h1>
          <p className="mt-1 max-w-xl text-ink-secondary">
            Track drafts, reviews, and live listings — with quick actions for
            every status.
          </p>
        </div>
        <Link href="/sell">
          <Button>Create listing</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <Input
            label="Search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by title…"
            autoComplete="off"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            label="Sort"
            value={sortId}
            onChange={(e) => setSortId(e.target.value)}
          >
            {MANAGE_SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {MANAGE_STATUS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-brand text-white'
                : 'bg-surface-muted text-ink-secondary hover:bg-surface-muted/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border"
            >
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          title="Couldn’t load your listings"
          description="Check your connection, then try again."
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              Try again
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={
            debouncedKeyword
              ? 'No matches'
              : empty.title
          }
          description={
            debouncedKeyword
              ? `Nothing matched “${debouncedKeyword}”. Try another search or status.`
              : empty.description
          }
          action={
            <Link href="/sell">
              <Button>Create listing</Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-secondary">
            Showing {items.length}
            {query.hasNextPage ? '+' : ''} listing
            {items.length === 1 ? '' : 's'}
            {tab !== 'ALL'
              ? ` · ${MANAGE_STATUS_TABS.find((t) => t.id === tab)?.label}`
              : ''}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ManagedListingCard
                key={item.id}
                listing={item}
                domain={domainOf(item)}
              />
            ))}
          </div>
          <InfiniteSentinel
            disabled={!query.hasNextPage || query.isFetchingNextPage}
            onVisible={() => {
              if (query.hasNextPage) void query.fetchNextPage();
            }}
          />
          {query.isFetchingNextPage ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[16/10] w-full" />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
