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
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { useVehicleSearchUrlState } from '@/features/search/hooks/useVehicleSearchUrlState';
import {
  useVehicleSearchInfinite,
  VEHICLE_SORTS,
} from '@/features/vehicles';

function VehicleSearchInner() {
  const catalog = useCatalogFilters();
  const { state, keywordDraft, setKeywordDraft, submitKeyword, writeState } =
    useVehicleSearchUrlState();

  const priceBounds = priceRangeForCurrency(state.currencyCode);

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
    const idx = VEHICLE_SORTS.findIndex(
      (s) => s.sortBy === state.sortBy && s.sortOrder === state.sortOrder,
    );
    return idx >= 0 ? idx : 0;
  }, [state.sortBy, state.sortOrder]);

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
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      pageSize: 12,
    }),
    [state, priceBounds.max],
  );

  const search = useVehicleSearchInfinite(query, true);
  const items = search.data?.pages.flatMap((p) => p.items) ?? [];
  const total = search.data?.pages[0]?.total ?? 0;
  const loadedPages = search.data?.pages.length ?? 0;

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
          value={String(sortIndex)}
          onChange={(e) => {
            const next = VEHICLE_SORTS[Number(e.target.value)] ?? VEHICLE_SORTS[0]!;
            writeState({ sortBy: next.sortBy, sortOrder: next.sortOrder });
          }}
          className="w-56"
        >
          {VEHICLE_SORTS.map((s, i) => (
            <option key={`${s.sortBy}-${s.sortOrder}`} value={i}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <form
        className="mb-6 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card md:grid-cols-[1fr_auto]"
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
        />
        <div className="flex items-end">
          <Button type="submit" className="w-full md:w-auto">
            Search
          </Button>
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold text-ink">Filters</p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => writeState({ categoryCode: '' })}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                onClick={() => writeState({ categoryCode: c.code })}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                  if (!search.hasNextPage || search.isFetchingNextPage) return;
                  void (async () => {
                    const result = await search.fetchNextPage();
                    const pages = result.data?.pages.length ?? loadedPages + 1;
                    writeState(
                      { page: pages },
                      { resetPage: false, history: 'replace' },
                    );
                  })();
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
