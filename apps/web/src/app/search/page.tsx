'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { useAuth } from '@/features/auth/AuthProvider';
import { CATEGORIES } from '@/features/listings/domain/types';
import { SEARCH_SORTS, type SearchSort } from '@/features/search/domain/types';
import {
  applySavedFilters,
  MILEAGE_MAX,
  PRICE_MAX,
  YEAR_MAX,
  YEAR_MIN,
} from '@/features/search/lib/apply-saved-filters';
import {
  useCatalogFilters,
  useMarketplaceSearchInfinite,
  useSavedSearchMutations,
  useSavedSearches,
  useSearchSuggestions,
} from '@/features/search/hooks/useMarketplaceSearch';

function SearchInner() {
  const params = useSearchParams();
  const { status } = useAuth();
  const authenticated = status === 'authenticated';
  const catalog = useCatalogFilters();
  const saved = useSavedSearches(authenticated);
  const savedMutations = useSavedSearchMutations();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [submitted, setSubmitted] = useState(params.get('q') ?? '');
  const [categoryCode, setCategoryCode] = useState(params.get('category') ?? '');
  const [brandId, setBrandId] = useState(params.get('brandId') ?? '');
  const [modelId, setModelId] = useState(params.get('modelId') ?? '');
  const [bodyTypeId, setBodyTypeId] = useState('');
  const [colorId, setColorId] = useState('');
  const [governorateId, setGovernorateId] = useState(params.get('governorateId') ?? '');
  const [cityId, setCityId] = useState(params.get('cityId') ?? '');
  const [fuelTypeId, setFuelTypeId] = useState('');
  const [transmissionTypeId, setTransmissionTypeId] = useState('');
  const [sort, setSort] = useState<SearchSort>('NEWEST');
  const [price, setPrice] = useState<[number, number]>([0, PRICE_MAX]);
  const [year, setYear] = useState<[number, number]>([YEAR_MIN, YEAR_MAX]);
  const [mileage, setMileage] = useState<[number, number]>([0, MILEAGE_MAX]);
  const [featuredOnly, setFeaturedOnly] = useState(params.get('featured') === '1');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useSearchSuggestions(q, showSuggestions && q.trim().length >= 2);

  const models = useMemo(
    () =>
      (catalog.data?.models ?? []).filter((m) => !brandId || m.brandId === brandId),
    [catalog.data?.models, brandId],
  );

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !governorateId || c.governorateId === governorateId,
      ),
    [catalog.data?.cities, governorateId],
  );

  const query = useMemo(
    () => ({
      q: submitted.trim() || undefined,
      categoryCode: categoryCode || undefined,
      brandId: brandId || undefined,
      modelId: modelId || undefined,
      bodyTypeId: bodyTypeId || undefined,
      colorId: colorId || undefined,
      governorateId: governorateId || undefined,
      cityId: cityId || undefined,
      fuelTypeId: fuelTypeId || undefined,
      transmissionTypeId: transmissionTypeId || undefined,
      minPrice: price[0] > 0 ? price[0] : undefined,
      maxPrice: price[1] < PRICE_MAX ? price[1] : undefined,
      minYear: year[0] > YEAR_MIN ? year[0] : undefined,
      maxYear: year[1] < YEAR_MAX ? year[1] : undefined,
      minMileage: mileage[0] > 0 ? mileage[0] : undefined,
      maxMileage: mileage[1] < MILEAGE_MAX ? mileage[1] : undefined,
      featuredOnly: featuredOnly || undefined,
      sort,
      pageSize: 12,
    }),
    [
      submitted,
      categoryCode,
      brandId,
      modelId,
      bodyTypeId,
      colorId,
      governorateId,
      cityId,
      fuelTypeId,
      transmissionTypeId,
      price,
      year,
      mileage,
      featuredOnly,
      sort,
    ],
  );

  const search = useMarketplaceSearchInfinite(query, true);
  const items = search.data?.pages.flatMap((p) => p.items) ?? [];
  const total = search.data?.pages[0]?.total ?? 0;

  const restoreSaved = (filters: Record<string, unknown>, savedSort?: string) => {
    const next = applySavedFilters(filters);
    if (next.q != null) {
      setQ(next.q);
      setSubmitted(next.submitted ?? next.q);
    }
    if (next.categoryCode != null) setCategoryCode(next.categoryCode);
    if (next.brandId != null) setBrandId(next.brandId);
    if (next.modelId != null) setModelId(next.modelId);
    if (next.bodyTypeId != null) setBodyTypeId(next.bodyTypeId);
    if (next.colorId != null) setColorId(next.colorId);
    if (next.governorateId != null) setGovernorateId(next.governorateId);
    if (next.cityId != null) setCityId(next.cityId);
    if (next.fuelTypeId != null) setFuelTypeId(next.fuelTypeId);
    if (next.transmissionTypeId != null) setTransmissionTypeId(next.transmissionTypeId);
    if (next.price) setPrice(next.price);
    if (next.year) setYear(next.year);
    if (next.mileage) setMileage(next.mileage);
    if (next.featuredOnly != null) setFeaturedOnly(next.featuredOnly);
    if (savedSort) setSort(savedSort as SearchSort);
    else if (next.sort) setSort(next.sort);
  };

  return (
    <div className="page-container py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Search vehicles</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {search.isLoading ? 'Searching…' : `${total.toLocaleString()} results`}
          </p>
        </div>
        <Select
          label="Sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SearchSort)}
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
        className="mb-6 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card md:grid-cols-[1fr_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(q);
          setShowSuggestions(false);
        }}
      >
        <div className="relative">
          <Input
            label="Keyword"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Toyota, Camry, Baghdad, plate…"
          />
          {showSuggestions && (suggestions.data?.length ?? 0) > 0 ? (
            <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-surface shadow-lift">
              {(suggestions.data ?? []).map((s, i) => (
                <li key={`${s.type}-${s.id ?? s.label}-${i}`}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQ(s.label);
                      setSubmitted(s.label);
                      setShowSuggestions(false);
                      if (s.type === 'BRAND' && s.id) setBrandId(s.id);
                      if (s.type === 'MODEL' && s.id) setModelId(s.id);
                    }}
                  >
                    <span>{s.label}</span>
                    <span className="text-xs text-ink-secondary">{s.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full md:w-auto">
            Search
          </Button>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="secondary"
            className="w-full md:w-auto"
            disabled={!authenticated || savedMutations.save.isPending}
            onClick={() =>
              void savedMutations.save.mutateAsync({
                name: submitted || categoryCode || 'Saved search',
                query: submitted || undefined,
                filters: query as unknown as Record<string, unknown>,
                sort,
              })
            }
          >
            Save search
          </Button>
        </div>
      </form>

      <div className="mb-8 grid gap-4 lg:grid-cols-[280px_1fr]">
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

          <RangeField
            label="Price (IQD)"
            min={0}
            max={PRICE_MAX}
            step={500_000}
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

          <Select
            label="Model"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            disabled={!brandId && models.length > 20}
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
            value={bodyTypeId}
            onChange={(e) => setBodyTypeId(e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.bodyTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>

          <Select label="Color" value={colorId} onChange={(e) => setColorId(e.target.value)}>
            <option value="">Any</option>
            {(catalog.data?.colors ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
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

          <Select
            label="Fuel"
            value={fuelTypeId}
            onChange={(e) => setFuelTypeId(e.target.value)}
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

          {authenticated ? (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm font-semibold text-ink">Saved searches</p>
              {(saved.data ?? []).length === 0 ? (
                <p className="text-xs text-ink-secondary">No saved searches yet.</p>
              ) : (
                <ul className="space-y-2">
                  {(saved.data ?? []).map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <button
                        type="button"
                        className="truncate text-left font-medium text-brand hover:underline"
                        onClick={() => restoreSaved(row.filters ?? {}, row.sort)}
                      >
                        {row.name || row.query || 'Saved search'}
                      </button>
                      <button
                        type="button"
                        className="text-ink-secondary hover:text-error"
                        onClick={() => void savedMutations.remove.mutateAsync(row.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="border-t border-border pt-4 text-xs text-ink-secondary">
              <Link href="/login" className="font-semibold text-brand">
                Sign in
              </Link>{' '}
              to save searches.
            </p>
          )}
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
              description="Try adjusting filters or broadening your keyword."
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
