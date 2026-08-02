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
import { CATEGORIES, type ListingCategoryCode } from '@/features/listings/domain/types';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import { priceRangeForCurrency } from '@/features/currencies/domain/types';
import { SearchExtras } from '@/features/search/components/SearchExtras';
import {
  SEARCH_SORTS,
  type MarketplaceSearchQuery,
  type SearchSort,
} from '@/features/search/domain/types';
import {
  useCatalogFilters,
  useMarketplaceSearchInfinite,
  useSearchFacets,
} from '@/features/search/hooks/useMarketplaceSearch';
import {
  MILEAGE_MAX,
  YEAR_MAX,
  YEAR_MIN,
} from '@/features/search/lib/apply-saved-filters';
import {
  parseSearchParams,
  pushSearchUrl,
} from '@/features/search/lib/url-search-state';

function facetCount(
  buckets: Array<{ id: string; count: number; code?: string }> | undefined,
  id: string,
): number | undefined {
  return buckets?.find((b) => b.id === id)?.count;
}

function categoryFacetCount(
  buckets: Array<{ id: string; count: number; code?: string }> | undefined,
  code: string,
): number | undefined {
  return buckets?.find((b) => b.code === code || b.id === code)?.count;
}

function VehicleSearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const catalog = useCatalogFilters();

  const initial = useMemo(
    () =>
      parseSearchParams(params, { domain: 'VEHICLE', pageSize: 12, sort: 'NEWEST' }),
    [params],
  );

  const [state, setState] = useState<MarketplaceSearchQuery>(initial);
  const [keywordDraft, setKeywordDraft] = useState(initial.q ?? '');

  useEffect(() => {
    const next = parseSearchParams(params, {
      domain: 'VEHICLE',
      pageSize: 12,
      sort: 'NEWEST',
    });
    setState(next);
    setKeywordDraft(next.q ?? '');
  }, [params]);

  const patch = useCallback(
    (partial: Partial<MarketplaceSearchQuery>) => {
      setState((prev) => {
        const next = { ...prev, ...partial, domain: 'VEHICLE' as const };
        pushSearchUrl('/vehicles/search', next, router);
        return next;
      });
    },
    [router],
  );

  const priceBounds = priceRangeForCurrency(state.currencyCode ?? 'IQD');
  const price: [number, number] = [
    state.minPrice ?? 0,
    state.maxPrice ?? priceBounds.max,
  ];
  const year: [number, number] = [
    state.minYear ?? YEAR_MIN,
    state.maxYear ?? YEAR_MAX,
  ];
  const mileage: [number, number] = [
    state.minMileage ?? 0,
    state.maxMileage ?? MILEAGE_MAX,
  ];

  const query = useMemo(
    () => ({
      ...state,
      domain: 'VEHICLE' as const,
      q: state.q,
      pageSize: 12,
    }),
    [state],
  );

  const search = useMarketplaceSearchInfinite(query, true);
  const facets = useSearchFacets(query, true);
  const items = search.data?.pages.flatMap((p) => p.items) ?? [];
  const total = search.data?.pages[0]?.total ?? 0;

  const models = useMemo(
    () =>
      (catalog.data?.models ?? []).filter(
        (m) => !state.brandId || m.brandId === state.brandId,
      ),
    [catalog.data?.models, state.brandId],
  );
  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !state.governorateId || c.governorateId === state.governorateId,
      ),
    [catalog.data?.cities, state.governorateId],
  );
  const vehicleCategories = useMemo(
    () => CATEGORIES.filter((c) => c.code !== 'PLATE'),
    [],
  );

  return (
    <div className="page-container py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Vehicles', href: '/vehicles' },
          { label: 'Search' },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Search vehicles</h1>
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
          {SEARCH_SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <form
        className="mb-4 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card md:grid-cols-[1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          patch({ q: keywordDraft.trim() || undefined });
        }}
      >
        <Input
          label="Keyword"
          value={keywordDraft}
          onChange={(e) => setKeywordDraft(e.target.value)}
          placeholder="Toyota, Camry, Baghdad…"
        />
        <div className="flex items-end">
          <Button type="submit" className="w-full md:w-auto">
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

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold text-ink">Filters</p>
          {facets.data ? (
            <p className="text-xs text-ink-secondary">
              Featured {facets.data.featured.count} · Verified{' '}
              {facets.data.verified.count}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => patch({ categoryCode: undefined })}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                !state.categoryCode
                  ? 'bg-brand text-white'
                  : 'bg-surface-muted text-ink-secondary'
              }`}
            >
              All
            </button>
            {vehicleCategories.map((c) => {
              const count = categoryFacetCount(facets.data?.categories, c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  disabled={count === 0}
                  onClick={() =>
                    patch({ categoryCode: c.code as ListingCategoryCode })
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    state.categoryCode === c.code
                      ? 'bg-brand text-white'
                      : 'bg-surface-muted text-ink-secondary'
                  } disabled:opacity-40`}
                >
                  {c.label}
                  {count != null ? ` (${count})` : ''}
                </button>
              );
            })}
          </div>

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
            className="mb-3 block text-sm"
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
          <RangeField
            label="Year"
            min={YEAR_MIN}
            max={YEAR_MAX}
            value={year}
            onChange={([min, max]) =>
              patch({
                minYear: min > YEAR_MIN ? min : undefined,
                maxYear: max < YEAR_MAX ? max : undefined,
              })
            }
          />
          <RangeField
            label="Mileage (km)"
            min={0}
            max={MILEAGE_MAX}
            step={1000}
            value={mileage}
            onChange={([min, max]) =>
              patch({
                minMileage: min > 0 ? min : undefined,
                maxMileage: max < MILEAGE_MAX ? max : undefined,
              })
            }
            format={(n) => n.toLocaleString()}
          />

          <Select
            label="Brand"
            value={state.brandId ?? ''}
            onChange={(e) =>
              patch({ brandId: e.target.value || undefined, modelId: undefined })
            }
          >
            <option value="">Any brand</option>
            {(catalog.data?.brands ?? []).map((b) => {
              const count = facetCount(facets.data?.brands, b.id);
              return (
                <option
                  key={b.id}
                  value={b.id}
                  disabled={count === 0}
                >
                  {b.nameEn}
                  {count != null ? ` (${count})` : ''}
                </option>
              );
            })}
          </Select>

          <Select
            label="Model"
            value={state.modelId ?? ''}
            onChange={(e) => patch({ modelId: e.target.value || undefined })}
          >
            <option value="">Any model</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="Body type"
            value={state.bodyTypeId ?? ''}
            onChange={(e) => patch({ bodyTypeId: e.target.value || undefined })}
          >
            <option value="">Any</option>
            {(catalog.data?.bodyTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="Transmission"
            value={state.transmissionTypeId ?? ''}
            onChange={(e) =>
              patch({ transmissionTypeId: e.target.value || undefined })
            }
          >
            <option value="">Any</option>
            {(catalog.data?.transmissionTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="Fuel"
            value={state.fuelTypeId ?? ''}
            onChange={(e) => patch({ fuelTypeId: e.target.value || undefined })}
          >
            <option value="">Any</option>
            {(catalog.data?.fuelTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="Governorate"
            value={state.governorateId ?? ''}
            onChange={(e) =>
              patch({
                governorateId: e.target.value || undefined,
                cityId: undefined,
              })
            }
          >
            <option value="">All Iraq</option>
            {(catalog.data?.governorates ?? []).map((g) => {
              const count = facetCount(facets.data?.governorates, g.id);
              return (
                <option key={g.id} value={g.id} disabled={count === 0}>
                  {g.nameEn}
                  {count != null ? ` (${count})` : ''}
                </option>
              );
            })}
          </Select>

          <Select
            label="City"
            value={state.cityId ?? ''}
            onChange={(e) => patch({ cityId: e.target.value || undefined })}
          >
            <option value="">Any city</option>
            {cities.map((c) => {
              const count = facetCount(facets.data?.cities, c.id);
              return (
                <option key={c.id} value={c.id} disabled={count === 0}>
                  {c.nameEn}
                  {count != null ? ` (${count})` : ''}
                </option>
              );
            })}
          </Select>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={Boolean(state.featuredOnly)}
              onChange={(e) =>
                patch({ featuredOnly: e.target.checked || undefined })
              }
              className="rounded border-border"
            />
            Featured only
            {facets.data ? ` (${facets.data.featured.count})` : ''}
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={Boolean(state.verifiedOnly)}
              onChange={(e) =>
                patch({ verifiedOnly: e.target.checked || undefined })
              }
              className="rounded border-border"
            />
            Verified only
            {facets.data ? ` (${facets.data.verified.count})` : ''}
          </label>
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
              description={
                search.error instanceof Error ? search.error.message : 'Try again'
              }
              action={
                <Button variant="secondary" onClick={() => void search.refetch()}>
                  Retry
                </Button>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No vehicles found"
              description="Try adjusting filters or broadening your keyword."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    href={`/vehicles/${item.id}`}
                  />
                ))}
              </div>
              <InfiniteSentinel
                disabled={!search.hasNextPage || search.isFetchingNextPage}
                onVisible={() => {
                  if (search.hasNextPage) void search.fetchNextPage();
                }}
              />
              {search.isFetchingNextPage ? (
                <p className="py-6 text-center text-sm text-ink-secondary">
                  Loading more…
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VehicleSearchPage() {
  return (
    <Suspense fallback={<div className="page-container py-20">Loading search…</div>}>
      <VehicleSearchInner />
    </Suspense>
  );
}
