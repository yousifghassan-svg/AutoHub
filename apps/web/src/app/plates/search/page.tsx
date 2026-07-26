'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InfiniteSentinel } from '@/components/InfiniteSentinel';
import { ListingCard } from '@/components/ListingCard';
import {
  Button,
  EmptyState,
  Input,
  RangeField,
  Select,
  Skeleton,
} from '@/components/ui';
import {
  GOVERNORATES,
  formatCodeFor,
} from '@/features/plates';
import type { IraqiGovernorate } from '@/features/plates/domain/types';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import { priceRangeForCurrency } from '@/features/currencies/domain/types';
import { usePlateSearchInfinite } from '@/features/plates/hooks/usePlates';

function PlateSearchInner() {
  const params = useSearchParams();
  const [governorate, setGovernorate] = useState(params.get('province') ?? '');
  const [prefix, setPrefix] = useState(params.get('prefix') ?? '');
  const [series, setSeries] = useState(params.get('letter') ?? '');
  const [number, setNumber] = useState(params.get('number') ?? '');
  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [submitted, setSubmitted] = useState({
    prefix,
    series,
    number,
    keyword,
  });
  const [currencyCode, setCurrencyCode] = useState(params.get('currency') ?? 'IQD');
  const priceBounds = priceRangeForCurrency(currencyCode);
  const [price, setPrice] = useState<[number, number]>([0, priceBounds.max]);
  const [sortIndex, setSortIndex] = useState(0);

  const sortOptions = [
    { sortBy: 'createdAt' as const, sortOrder: 'desc' as const, label: 'Newest' },
    { sortBy: 'primaryPrice' as const, sortOrder: 'asc' as const, label: 'Price: low to high' },
    { sortBy: 'primaryPrice' as const, sortOrder: 'desc' as const, label: 'Price: high to low' },
  ];
  const sort = sortOptions[sortIndex] ?? sortOptions[0]!;

  const formatCode = governorate ? formatCodeFor(governorate as IraqiGovernorate) : undefined;

  const query = useMemo(
    () => ({
      formatCode,
      prefix: submitted.prefix.trim() || undefined,
      series: submitted.series.trim() || undefined,
      number: submitted.number.trim() || undefined,
      keyword: submitted.keyword.trim() || undefined,
      currencyCode,
      minPrice: price[0] > 0 ? price[0] : undefined,
      maxPrice: price[1] < priceBounds.max ? price[1] : undefined,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      pageSize: 24,
    }),
    [formatCode, submitted, currencyCode, price, priceBounds.max, sort.sortBy, sort.sortOrder],
  );

  const search = usePlateSearchInfinite(query, true);
  const items = search.data?.pages.flatMap((p) => p.items) ?? [];
  const total = search.data?.pages[0]?.total ?? 0;

  return (
    <div className="page-container py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Plates', href: '/plates' },
          { label: 'Search' },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Search plates</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {search.isLoading ? 'Searching…' : `${total.toLocaleString()} results`}
          </p>
        </div>
        <Select
          label="Sort"
          value={String(sortIndex)}
          onChange={(e) => setSortIndex(Number(e.target.value))}
          className="w-56"
        >
          {sortOptions.map((s, i) => (
            <option key={`${s.sortBy}-${s.sortOrder}`} value={i}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <form
        className="mb-6 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card sm:grid-cols-2 lg:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted({ prefix, series, number, keyword });
        }}
      >
        <Select
          label="Province"
          value={governorate}
          onChange={(e) => setGovernorate(e.target.value)}
        >
          <option value="">All governorates</option>
          {(Object.keys(GOVERNORATES) as IraqiGovernorate[]).map((g) => (
            <option key={g} value={g}>
              {GOVERNORATES[g].nameEn}
            </option>
          ))}
        </Select>
        <Input
          label="Prefix / code"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="11"
        />
        <Input
          label="Letter"
          value={series}
          onChange={(e) => setSeries(e.target.value.toUpperCase())}
          placeholder="A"
          maxLength={3}
        />
        <Input
          label="Number"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="12345"
        />
        <Input
          label="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="VIP, repeating…"
        />
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Search
          </Button>
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold text-ink">Filters</p>
          <CurrencySelect
            value={currencyCode}
            onChange={(code) => {
              const next = priceRangeForCurrency(code);
              setCurrencyCode(code);
              setPrice([0, next.max]);
            }}
          />
          <RangeField
            label={`Price (${currencyCode})`}
            min={0}
            max={priceBounds.max}
            step={priceBounds.step}
            value={price}
            onChange={setPrice}
            format={(n) => n.toLocaleString()}
          />
        </aside>

        <div>
          {search.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[700/220] w-full" />
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
              title="No plates found"
              description="Try different filters or broaden your search."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ListingCard key={item.id} listing={item} href={`/plates/${item.id}`} />
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

export default function PlateSearchPage() {
  return (
    <Suspense fallback={<div className="page-container py-20">Loading search…</div>}>
      <PlateSearchInner />
    </Suspense>
  );
}
