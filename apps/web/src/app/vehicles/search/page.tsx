'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
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
import { CATEGORIES } from '@/features/listings/domain/types';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import { priceRangeForCurrency } from '@/features/currencies/domain/types';
import {
  MILEAGE_MAX,
  YEAR_MAX,
  YEAR_MIN,
} from '@/features/search/lib/apply-saved-filters';
import {
  buildActiveFilterChips,
  clearedVehicleSearchFilters,
  hasActiveVehicleFilters,
} from '@/features/search/lib/vehicle-search-filters';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { useVehicleSearchUrlState } from '@/features/search/hooks/useVehicleSearchUrlState';
import { buildVehicleSearchApiSort } from '@/features/vehicles/data/vehicle-search-api-query';
import {
  useVehicleSearchInfinite,
  VEHICLE_SORTS,
} from '@/features/vehicles';

function ResultCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-card"
      aria-hidden
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

function ResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading search results"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ResultCardSkeleton key={i} />
      ))}
    </div>
  );
}

function VehicleSearchInner() {
  const catalog = useCatalogFilters();
  const { state, keywordDraft, setKeywordDraft, submitKeyword, writeState } =
    useVehicleSearchUrlState();

  const priceBounds = priceRangeForCurrency(state.currencyCode);
  const filtersActive = hasActiveVehicleFilters(state);

  const [priceDraft, setPriceDraft] = useState<[number, number]>([
    state.minPrice,
    state.maxPrice,
  ]);
  const [yearDraft, setYearDraft] = useState<[number, number]>([
    state.minYear,
    state.maxYear,
  ]);
  const [mileageDraft, setMileageDraft] = useState<[number, number]>([
    state.minMileage,
    state.maxMileage,
  ]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setFiltersOpen(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setPriceDraft([state.minPrice, state.maxPrice]);
  }, [state.minPrice, state.maxPrice, state.currencyCode]);

  useEffect(() => {
    setYearDraft([state.minYear, state.maxYear]);
  }, [state.minYear, state.maxYear]);

  useEffect(() => {
    setMileageDraft([state.minMileage, state.maxMileage]);
  }, [state.minMileage, state.maxMileage]);

  const sortIndex = useMemo(() => {
    if (!state.sortBy) {
      // Display-only default: keyword → Best match; browse → Newest.
      const fallback = state.q.trim()
        ? VEHICLE_SORTS.findIndex((s) => s.sortBy === 'relevance')
        : VEHICLE_SORTS.findIndex(
            (s) => s.sortBy === 'createdAt' && s.sortOrder === 'desc',
          );
      return fallback >= 0 ? fallback : 0;
    }
    const idx = VEHICLE_SORTS.findIndex(
      (s) => s.sortBy === state.sortBy && s.sortOrder === state.sortOrder,
    );
    return idx >= 0 ? idx : 0;
  }, [state.q, state.sortBy, state.sortOrder]);

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

  const chipLabels = useMemo(() => {
    const brands = catalog.data?.brands ?? [];
    const bodyTypes = catalog.data?.bodyTypes ?? [];
    const fuels = catalog.data?.fuelTypes ?? [];
    const transmissions = catalog.data?.transmissionTypes ?? [];
    const governorates = catalog.data?.governorates ?? [];
    return {
      categoryLabel: vehicleCategories.find((c) => c.code === state.categoryCode)
        ?.label,
      brandName: brands.find((b) => b.id === state.brandId)?.nameEn,
      modelName: models.find((m) => m.id === state.modelId)?.nameEn,
      bodyName: bodyTypes.find((t) => t.id === state.bodyTypeId)?.nameEn,
      fuelName: fuels.find((t) => t.id === state.fuelTypeId)?.nameEn,
      transmissionName: transmissions.find(
        (t) => t.id === state.transmissionTypeId,
      )?.nameEn,
      governorateName: governorates.find((g) => g.id === state.governorateId)
        ?.nameEn,
      cityName: cities.find((c) => c.id === state.cityId)?.nameEn,
    };
  }, [
    catalog.data,
    cities,
    models,
    state.bodyTypeId,
    state.brandId,
    state.categoryCode,
    state.cityId,
    state.fuelTypeId,
    state.governorateId,
    state.modelId,
    state.transmissionTypeId,
    vehicleCategories,
  ]);

  const activeChips = useMemo(
    () => buildActiveFilterChips(state, chipLabels),
    [state, chipLabels],
  );

  const query = useMemo(
    () => ({
      keyword: state.q.trim() || undefined,
      categoryCode: state.categoryCode || undefined,
      makeId: state.brandId || undefined,
      modelId: state.modelId || undefined,
      bodyTypeId: state.bodyTypeId || undefined,
      fuelTypeId: state.fuelTypeId || undefined,
      transmissionTypeId: state.transmissionTypeId || undefined,
      governorateId: state.governorateId || undefined,
      cityId: state.cityId || undefined,
      currencyCode: state.currencyCode,
      minPrice: state.minPrice > 0 ? state.minPrice : undefined,
      maxPrice: state.maxPrice < priceBounds.max ? state.maxPrice : undefined,
      minYear: state.minYear > YEAR_MIN ? state.minYear : undefined,
      maxYear: state.maxYear < YEAR_MAX ? state.maxYear : undefined,
      minMileage: state.minMileage > 0 ? state.minMileage : undefined,
      maxMileage: state.maxMileage < MILEAGE_MAX ? state.maxMileage : undefined,
      isFeatured: state.featured || undefined,
      ...buildVehicleSearchApiSort(state.sortBy, state.sortOrder),
      pageSize: 12,
    }),
    [state, priceBounds.max],
  );

  const search = useVehicleSearchInfinite(query, true);
  const items = search.data?.pages.flatMap((p) => p.items) ?? [];
  const total = search.data?.pages[0]?.total ?? 0;
  const loadedPages = search.data?.pages.length ?? 0;
  const isInitialLoading = search.isLoading && items.length === 0;
  const isRefetching =
    search.isFetching && !search.isFetchingNextPage && items.length > 0;

  // Hydrate shared links with page>1 by fetching until URL page is reached.
  useEffect(() => {
    if (
      loadedPages > 0 &&
      loadedPages < state.page &&
      search.hasNextPage &&
      !search.isFetchingNextPage
    ) {
      void search.fetchNextPage();
    }
  }, [
    loadedPages,
    state.page,
    search.hasNextPage,
    search.isFetchingNextPage,
    search.fetchNextPage,
  ]);

  const loadMore = () => {
    if (!search.hasNextPage || search.isFetchingNextPage) return;
    void (async () => {
      const result = await search.fetchNextPage();
      const pages = result.data?.pages.length ?? loadedPages + 1;
      writeState({ page: pages }, { resetPage: false, history: 'replace' });
    })();
  };

  const clearAllFilters = () => {
    setKeywordDraft('');
    writeState(clearedVehicleSearchFilters());
  };

  const resultSummary = isInitialLoading
    ? 'Searching…'
    : total === 0
      ? 'No results'
      : `${total.toLocaleString()} result${total === 1 ? '' : 's'}`;

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
          <p
            className="mt-1 text-sm text-ink-secondary"
            aria-live="polite"
            aria-atomic="true"
          >
            {resultSummary}
            {isRefetching ? (
              <span className="ms-2 text-ink-secondary">Updating…</span>
            ) : null}
          </p>
        </div>
        <Select
          label="Sort"
          value={String(sortIndex)}
          onChange={(e) => {
            const next = VEHICLE_SORTS[Number(e.target.value)] ?? VEHICLE_SORTS[0]!;
            writeState({ sortBy: next.sortBy, sortOrder: next.sortOrder });
          }}
          className="w-full sm:w-56"
        >
          {VEHICLE_SORTS.map((s, i) => (
            <option key={`${s.sortBy}-${s.sortOrder}`} value={i}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <form
        className="mb-4 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card md:grid-cols-[1fr_auto]"
        role="search"
        aria-label="Vehicle keyword search"
        onSubmit={(e) => {
          e.preventDefault();
          submitKeyword();
        }}
      >
        <Input
          label="Keyword"
          value={keywordDraft}
          onChange={(e) => setKeywordDraft(e.target.value)}
          placeholder="Toyota, Camry, Baghdad…"
          autoComplete="off"
        />
        <div className="flex items-end gap-2">
          {keywordDraft.trim() ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full md:w-auto"
              onClick={() => {
                setKeywordDraft('');
                writeState({ q: '' });
              }}
            >
              Clear
            </Button>
          ) : null}
          <Button type="submit" className="w-full md:w-auto">
            Search
          </Button>
        </div>
      </form>

      {activeChips.length > 0 ? (
        <div
          className="mb-4 flex flex-wrap items-center gap-2"
          aria-label="Active filters"
        >
          {activeChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                if (chip.id === 'q') setKeywordDraft('');
                writeState(chip.clear);
              }}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              aria-label={`Remove filter ${chip.label}`}
            >
              <span className="truncate">{chip.label}</span>
              <span aria-hidden className="text-ink-secondary">
                ×
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="mb-4 lg:hidden">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          aria-expanded={filtersOpen}
          aria-controls="vehicle-search-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          {filtersOpen ? 'Hide filters' : 'Show filters'}
          {filtersActive ? ` (${activeChips.length})` : ''}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside
          id="vehicle-search-filters"
          className={`space-y-5 rounded-xl border border-border bg-surface p-4 shadow-card ${
            filtersOpen ? 'block' : 'hidden lg:block'
          }`}
          aria-label="Search filters"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Filters</p>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div
            role="radiogroup"
            aria-label="Vehicle category"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              role="radio"
              aria-checked={!state.categoryCode}
              onClick={() => writeState({ categoryCode: '' })}
              className={`rounded-full px-3 py-1 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                !state.categoryCode
                  ? 'bg-brand text-white'
                  : 'bg-surface-muted text-ink-secondary'
              }`}
            >
              All
            </button>
            {vehicleCategories.map((c) => (
              <button
                key={c.code}
                type="button"
                role="radio"
                aria-checked={state.categoryCode === c.code}
                onClick={() => writeState({ categoryCode: c.code })}
                className={`rounded-full px-3 py-1 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  state.categoryCode === c.code
                    ? 'bg-brand text-white'
                    : 'bg-surface-muted text-ink-secondary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <CurrencySelect
            value={state.currencyCode}
            onChange={(code) => writeState({ currencyCode: code })}
            className="mb-3 block text-sm"
          />
          <RangeField
            label={`Price (${state.currencyCode})`}
            min={0}
            max={priceBounds.max}
            step={priceBounds.step}
            value={priceDraft}
            onChange={(price) => {
              setPriceDraft(price);
              writeState(
                { minPrice: price[0], maxPrice: price[1] },
                { debounceMs: 250 },
              );
            }}
            format={(n) => n.toLocaleString()}
          />
          <RangeField
            label="Year"
            min={YEAR_MIN}
            max={YEAR_MAX}
            value={yearDraft}
            onChange={(year) => {
              setYearDraft(year);
              writeState(
                { minYear: year[0], maxYear: year[1] },
                { debounceMs: 250 },
              );
            }}
          />
          <RangeField
            label="Mileage (km)"
            min={0}
            max={MILEAGE_MAX}
            step={1000}
            value={mileageDraft}
            onChange={(mileage) => {
              setMileageDraft(mileage);
              writeState(
                { minMileage: mileage[0], maxMileage: mileage[1] },
                { debounceMs: 250 },
              );
            }}
            format={(n) => n.toLocaleString()}
          />

          <Select
            label="Brand"
            value={state.brandId}
            onChange={(e) =>
              writeState({ brandId: e.target.value, modelId: '' })
            }
          >
            <option value="">Any brand</option>
            {(catalog.data?.brands ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="Model"
            value={state.modelId}
            onChange={(e) => writeState({ modelId: e.target.value })}
            disabled={!state.brandId}
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
            value={state.bodyTypeId}
            onChange={(e) => writeState({ bodyTypeId: e.target.value })}
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
            value={state.transmissionTypeId}
            onChange={(e) =>
              writeState({ transmissionTypeId: e.target.value })
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
            value={state.fuelTypeId}
            onChange={(e) => writeState({ fuelTypeId: e.target.value })}
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
            value={state.governorateId}
            onChange={(e) =>
              writeState({ governorateId: e.target.value, cityId: '' })
            }
          >
            <option value="">All Iraq</option>
            {(catalog.data?.governorates ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="City"
            value={state.cityId}
            onChange={(e) => writeState({ cityId: e.target.value })}
            disabled={!state.governorateId}
          >
            <option value="">Any city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </Select>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={state.featured}
              onChange={(e) => writeState({ featured: e.target.checked })}
              className="rounded border-border"
            />
            Featured only
          </label>
        </aside>

        <div
          className={
            isRefetching ? 'opacity-70 transition-opacity duration-150' : undefined
          }
        >
          {isInitialLoading ? (
            <ResultsSkeleton />
          ) : search.isError ? (
            <EmptyState
              title="Search failed"
              description={
                search.error instanceof Error
                  ? search.error.message
                  : 'Something went wrong. Please try again.'
              }
              action={
                <Button
                  variant="secondary"
                  onClick={() => void search.refetch()}
                >
                  Retry
                </Button>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No vehicles found"
              description={
                filtersActive
                  ? 'Try clearing filters or broadening your keyword.'
                  : 'Try a different keyword or check back later.'
              }
              action={
                filtersActive ? (
                  <Button variant="secondary" onClick={clearAllFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                role="list"
                aria-label="Search results"
              >
                {items.map((item) => (
                  <div key={item.id} role="listitem">
                    <ListingCard
                      listing={item}
                      href={`/vehicles/${item.id}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                <InfiniteSentinel
                  disabled={!search.hasNextPage || search.isFetchingNextPage}
                  onVisible={loadMore}
                />
                {search.hasNextPage ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={search.isFetchingNextPage}
                    onClick={loadMore}
                    aria-busy={search.isFetchingNextPage}
                  >
                    {search.isFetchingNextPage ? 'Loading more…' : 'Load more'}
                  </Button>
                ) : (
                  <p className="text-sm text-ink-secondary" aria-live="polite">
                    Showing all {total.toLocaleString()} results
                  </p>
                )}
                {search.isFetchingNextPage ? (
                  <div
                    className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    aria-hidden
                  >
                    <ResultCardSkeleton />
                    <ResultCardSkeleton />
                    <ResultCardSkeleton />
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchPageFallback() {
  return (
    <div className="page-container py-10">
      <Skeleton className="mb-6 h-8 w-48" />
      <Skeleton className="mb-4 h-24 w-full" />
      <ResultsSkeleton />
    </div>
  );
}

export default function VehicleSearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <VehicleSearchInner />
    </Suspense>
  );
}
