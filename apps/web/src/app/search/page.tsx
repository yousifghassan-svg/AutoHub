'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { InfiniteSentinel } from '@/components/InfiniteSentinel';
import { ListingCard } from '@/components/ListingCard';
import { Button, EmptyState, Input, Skeleton } from '@/components/ui';
import { CATEGORIES } from '@/features/listings/domain/types';
import { useListingsInfinite } from '@/features/listings/hooks/useListings';

function SearchInner() {
  const params = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const initialCat = params.get('category') ?? undefined;
  const featuredOnly = params.get('featured') === '1';

  const [q, setQ] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);
  const [categoryCode, setCategoryCode] = useState<string | undefined>(initialCat);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const query = useMemo(
    () => ({
      keyword: submitted.trim().length >= 2 ? submitted.trim() : undefined,
      categoryCode,
      isFeatured: featuredOnly || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      pageSize: 12,
    }),
    [submitted, categoryCode, featuredOnly, minPrice, maxPrice],
  );

  const search = useListingsInfinite(query, true);
  const items = search.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-6">Search</h1>

      <form
        className="mb-6 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card md:grid-cols-[1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(q);
        }}
      >
        <Input
          label="Keyword"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Toyota, Camry, Baghdad…"
        />
        <div className="flex items-end">
          <Button type="submit" className="w-full md:w-auto">
            Search
          </Button>
        </div>
      </form>

      <div className="mb-8 grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-ink">Filters</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryCode(undefined)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                !categoryCode ? 'bg-brand text-white' : 'bg-surface-muted text-ink-secondary'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCategoryCode(c.code)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  categoryCode === c.code
                    ? 'bg-brand text-white'
                    : 'bg-surface-muted text-ink-secondary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <Input
            label="Min price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            label="Max price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </aside>

        <div>
          {search.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full" />
              ))}
            </div>
          ) : search.isError ? (
            <EmptyState
              title="Search failed"
              description={search.error instanceof Error ? search.error.message : 'Try again'}
              action={
                <Button variant="secondary" onClick={() => void search.refetch()}>
                  Retry
                </Button>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No results"
              description="Try another keyword or clear filters."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
              <InfiniteSentinel
                disabled={!search.hasNextPage || search.isFetchingNextPage}
                onVisible={() => {
                  if (search.hasNextPage) void search.fetchNextPage();
                }}
              />
              {search.isFetchingNextPage ? (
                <p className="py-6 text-center text-sm text-ink-secondary">Loading more…</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-container py-20">Loading search…</div>}>
      <SearchInner />
    </Suspense>
  );
}
