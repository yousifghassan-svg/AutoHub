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
import { CATEGORIES, type ListingCategoryCode } from '@/features/listings/domain/types';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import { priceRangeForCurrency } from '@/features/currencies/domain/types';
import {
  MILEAGE_MAX,
  YEAR_MAX,
  YEAR_MIN,
} from '@/features/search/lib/apply-saved-filters';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import {
  useVehicleSearchInfinite,
  VEHICLE_SORTS,
} from '@/features/vehicles';

function VehicleSearchInner() {
  const params = useSearchParams();
  const catalog = useCatalogFilters();

  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [submitted, setSubmitted] = useState(params.get('q') ?? '');
  const [categoryCode, setCategoryCode] = useState<ListingCategoryCode | ''>(
    (params.get('category') as ListingCategoryCode | null) ?? '',
  );
  const [brandId, setBrandId] = useState(params.get('brandId') ?? '');
  const [modelId, setModelId] = useState(params.get('modelId') ?? '');
  const [bodyTypeId, setBodyTypeId] = useState('');
  const [fuelTypeId, setFuelTypeId] = useState('');
  const [transmissionTypeId, setTransmissionTypeId] = useState('');
  const [governorateId, setGovernorateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [currencyCode, setCurrencyCode] = useState(params.get('currency') ?? 'IQD');
  const priceBounds = priceRangeForCurrency(currencyCode);
  const [price, setPrice] = useState<[number, number]>([0, priceBounds.max]);
  const [year, setYear] = useState<[number, number]>([YEAR_MIN, YEAR_MAX]);
  const [mileage, setMileage] = useState<[number, number]>([0, MILEAGE_MAX]);
  const [featuredOnly, setFeaturedOnly] = useState(params.get('featured') === '1');

  const sort = VEHICLE_SORTS[sortIndex] ?? VEHICLE_SORTS[0]!;

  const models = useMemo(
    () => (catalog.data?.models ?? []).filter((m) => !brandId || m.brandId === brandId),
    [catalog.data?.models, brandId],
  );

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !governorateId || c.governorateId === governorateId,
      ),
    [catalog.data?.cities, governorateId],
  );

  const vehicleCategories = useMemo(
    () => CATEGORIES.filter((c) => c.code !== 'PLATE'),
    [],
  );

  const query = useMemo(
    () => ({
      keyword: submitted.trim() || undefined,
      categoryCode: categoryCode || undefined,
      makeId: brandId || undefined,
      modelId: modelId || undefined,
      bodyTypeId: bodyTypeId || undefined,
      fuelTypeId: fuelTypeId || undefined,
      transmissionTypeId: transmissionTypeId || undefined,
      governorateId: governorateId || undefined,
      cityId: cityId || undefined,
      currencyCode,
      minPrice: price[0] > 0 ? price[0] : undefined,
      maxPrice: price[1] < priceBounds.max ? price[1] : undefined,
      minYear: year[0] > YEAR_MIN ? year[0] : undefined,
      maxYear: year[1] < YEAR_MAX ? year[1] : undefined,
      minMileage: mileage[0] > 0 ? mileage[0] : undefined,
      maxMileage: mileage[1] < MILEAGE_MAX ? mileage[1] : undefined,
      isFeatured: featuredOnly || undefined,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      pageSize: 12,
    }),
    [
      submitted,
      categoryCode,
      brandId,
      modelId,
      bodyTypeId,
      fuelTypeId,
      transmissionTypeId,
      governorateId,
      cityId,
      currencyCode,
      price,
      priceBounds.max,
      year,
      mileage,
      featuredOnly,
      sort.sortBy,
      sort.sortOrder,
    ],
  );

  const search = useVehicleSearchInfinite(query, true);
  const items = search.data?.pages.flatMap((p) => p.items) ?? [];
  const total = search.data?.pages[0]?.total ?? 0;

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
          onChange={(e) => setSortIndex(Number(e.target.value))}
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
          setSubmitted(keyword);
        }}
      >
        <Input
          label="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
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
              onClick={() => setCategoryCode('')}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                !categoryCode ? 'bg-brand text-white' : 'bg-surface-muted text-ink-secondary'
              }`}
            >
              All
            </button>
            {vehicleCategories.map((c) => (
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

          <CurrencySelect
            value={currencyCode}
            onChange={(code) => {
              const next = priceRangeForCurrency(code);
              setCurrencyCode(code);
              setPrice([0, next.max]);
            }}
            className="mb-3 block text-sm"
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
          <RangeField
            label="Year"
            min={YEAR_MIN}
            max={YEAR_MAX}
            value={year}
            onChange={setYear}
          />
          <RangeField
            label="Mileage (km)"
            min={0}
            max={MILEAGE_MAX}
            step={1000}
            value={mileage}
            onChange={setMileage}
            format={(n) => n.toLocaleString()}
          />

          <Select
            label="Brand"
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value);
              setModelId('');
            }}
          >
            <option value="">Any brand</option>
            {(catalog.data?.brands ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameEn}
              </option>
            ))}
          </Select>

          <Select label="Model" value={modelId} onChange={(e) => setModelId(e.target.value)}>
            <option value="">Any model</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameEn}
              </option>
            ))}
          </Select>

          <Select label="Body type" value={bodyTypeId} onChange={(e) => setBodyTypeId(e.target.value)}>
            <option value="">Any</option>
            {(catalog.data?.bodyTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="Transmission"
            value={transmissionTypeId}
            onChange={(e) => setTransmissionTypeId(e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.transmissionTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>

          <Select label="Fuel" value={fuelTypeId} onChange={(e) => setFuelTypeId(e.target.value)}>
            <option value="">Any</option>
            {(catalog.data?.fuelTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="Governorate"
            value={governorateId}
            onChange={(e) => {
              setGovernorateId(e.target.value);
              setCityId('');
            }}
          >
            <option value="">All Iraq</option>
            {(catalog.data?.governorates ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameEn}
              </option>
            ))}
          </Select>

          <Select label="City" value={cityId} onChange={(e) => setCityId(e.target.value)}>
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
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
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
              description={search.error instanceof Error ? search.error.message : 'Try again'}
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
                  <ListingCard key={item.id} listing={item} href={`/vehicles/${item.id}`} />
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

export default function VehicleSearchPage() {
  return (
    <Suspense fallback={<div className="page-container py-20">Loading search…</div>}>
      <VehicleSearchInner />
    </Suspense>
  );
}
