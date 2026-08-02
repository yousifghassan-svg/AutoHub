'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import { priceRangeForCurrency } from '@/features/currencies/domain/types';
import { formatCodeFor } from '@/features/plates';
import {
  IRAQI_GOVERNORATES,
  type IraqiGovernorate,
} from '@/features/plates/domain/types';
import { SearchExtras } from '@/features/search/components/SearchExtras';
import {
  SEARCH_SORTS,
  type MarketplaceSearchQuery,
  type SearchSort,
} from '@/features/search/domain/types';
import { useMarketplaceSearchInfinite } from '@/features/search/hooks/useMarketplaceSearch';
import {
  parseSearchParams,
  pushSearchUrl,
} from '@/features/search/lib/url-search-state';

function PlateSearchInner() {
  const router = useRouter();
  const params = useSearchParams();

  const initial = useMemo(
    () =>
      parseSearchParams(params, { domain: 'PLATE', pageSize: 24, sort: 'NEWEST' }),
    [params],
  );

  const [state, setState] = useState<MarketplaceSearchQuery>(initial);
  const [keywordDraft, setKeywordDraft] = useState(initial.q ?? '');
  const [province, setProvince] = useState(params.get('province') ?? '');

  useEffect(() => {
    const next = parseSearchParams(params, {
      domain: 'PLATE',
      pageSize: 24,
      sort: 'NEWEST',
    });
    setState(next);
    setKeywordDraft(next.q ?? '');
    setProvince(params.get('province') ?? '');
  }, [params]);

  const patch = useCallback(
    (partial: Partial<MarketplaceSearchQuery> & { province?: string }) => {
      const { province: nextProvince, ...rest } = partial;
      setState((prev) => {
        const prov = nextProvince !== undefined ? nextProvince : province;
        const formatCode = prov
          ? formatCodeFor(prov as IraqiGovernorate)
          : rest.formatCode !== undefined
            ? rest.formatCode
            : prev.formatCode;
        const next: MarketplaceSearchQuery = {
          ...prev,
          ...rest,
          domain: 'PLATE',
          formatCode: formatCode || undefined,
          pageSize: 24,
        };
        // reuse push via custom to include province alias
        pushSearchUrl('/plates/search', next, {
          replace: (href) => {
            if (prov) {
              const u = new URL(href, 'http://local');
              u.searchParams.set('province', prov);
              router.replace(`/plates/search?${u.searchParams.toString()}`);
            } else {
              router.replace(href);
            }
          },
        });
        if (nextProvince !== undefined) setProvince(nextProvince);
        return next;
      });
    },
    [province, router],
  );

  const priceBounds = priceRangeForCurrency(state.currencyCode ?? 'IQD');
  const price: [number, number] = [
    state.minPrice ?? 0,
    state.maxPrice ?? priceBounds.max,
  ];

  const query = useMemo(
    () => ({
      ...state,
      domain: 'PLATE' as const,
      pageSize: 24,
    }),
    [state],
  );

  const search = useMarketplaceSearchInfinite(query, true);
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
          value={state.sort ?? 'NEWEST'}
          onChange={(e) => patch({ sort: e.target.value as SearchSort })}
          className="w-56"
        >
          {SEARCH_SORTS.filter((s) => s.id !== 'MOST_VIEWED').map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <form
        className="mb-4 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          patch({
            q: keywordDraft.trim() || undefined,
            prefix: state.prefix,
            series: state.series,
            number: state.number,
          });
        }}
      >
        <Select
          label="Province"
          value={province}
          onChange={(e) => patch({ province: e.target.value })}
        >
          <option value="">Any</option>
          {IRAQI_GOVERNORATES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
        <Input
          label="Prefix"
          value={state.prefix ?? ''}
          onChange={(e) =>
            setState((s) => ({ ...s, prefix: e.target.value || undefined }))
          }
        />
        <Input
          label="Letter"
          value={state.series ?? ''}
          onChange={(e) =>
            setState((s) => ({ ...s, series: e.target.value || undefined }))
          }
        />
        <Input
          label="Number"
          value={state.number ?? ''}
          onChange={(e) =>
            setState((s) => ({ ...s, number: e.target.value || undefined }))
          }
        />
        <Select
          label="Digits"
          value={state.digits != null ? String(state.digits) : ''}
          onChange={(e) =>
            patch({
              digits: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        >
          <option value="">Any</option>
          {[3, 4, 5, 6].map((d) => (
            <option key={d} value={d}>
              {d} digits
            </option>
          ))}
        </Select>
        <Input
          label="Keyword"
          value={keywordDraft}
          onChange={(e) => setKeywordDraft(e.target.value)}
          className="md:col-span-2"
        />
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Search
          </Button>
        </div>
      </form>

      <div className="mb-6 rounded-xl border border-border bg-surface p-4 shadow-card">
        <SearchExtras
          keyword={keywordDraft}
          query={query}
          onApplyKeyword={(q) => {
            setKeywordDraft(q);
            patch({ q });
          }}
          onApplyFilters={(p) => patch(p)}
        />
      </div>

      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:grid-cols-2">
        <CurrencySelect
          value={state.currencyCode ?? 'IQD'}
          onChange={(code) => {
            const next = priceRangeForCurrency(code);
            patch({
              currencyCode: code,
              minPrice: undefined,
              maxPrice: next.max,
            });
          }}
        />
        <RangeField
          label={`Price (${state.currencyCode ?? 'IQD'})`}
          min={0}
          max={priceBounds.max}
          step={priceBounds.step}
          value={price}
          onChange={([min, max]) =>
            patch({
              minPrice: min > 0 ? min : undefined,
              maxPrice: max < priceBounds.max ? max : undefined,
            })
          }
          format={(n) => n.toLocaleString()}
        />
      </div>

      {search.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : search.isError ? (
        <EmptyState
          title="Search failed"
          description={
            search.error instanceof Error ? search.error.message : 'Try again'
          }
        />
      ) : items.length === 0 ? (
        <EmptyState title="No plates found" description="Adjust filters and try again." />
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
        </>
      )}
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
