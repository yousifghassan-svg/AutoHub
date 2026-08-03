'use client';

import { useEffect, useMemo } from 'react';
import { Input, Select, Skeleton } from '@/components/ui';
import { CATEGORIES } from '@/features/listings/domain/types';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import type { SellStepProps } from '../../core/types';
import { isCompleteListingLocation } from '../../lib/listing-location';

export function CategoryStep({ state, patchCommon, mode }: SellStepProps) {
  const catalog = useCatalogFilters();
  const categoryLocked = mode === 'edit';

  useEffect(() => {
    if (!catalog.data?.categories) return;
    const match = catalog.data.categories.find(
      (c) => c.code === state.categoryCode,
    );
    if (match && match.id !== state.categoryId) {
      patchCommon({ categoryId: match.id });
    }
  }, [
    catalog.data?.categories,
    patchCommon,
    state.categoryCode,
    state.categoryId,
  ]);

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !state.governorateId || c.governorateId === state.governorateId,
      ),
    [catalog.data?.cities, state.governorateId],
  );

  const selectedCity = useMemo(
    () => (catalog.data?.cities ?? []).find((c) => c.id === state.cityId),
    [catalog.data?.cities, state.cityId],
  );

  const locationOk = isCompleteListingLocation(
    {
      governorateId: state.governorateId,
      cityId: state.cityId,
      locationLat: state.locationLat,
      locationLng: state.locationLng,
    },
    selectedCity,
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-ink-secondary">
          Listing type
        </p>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Listing type"
          aria-disabled={categoryLocked || undefined}
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.code}
              type="button"
              role="radio"
              aria-checked={state.categoryCode === c.code}
              disabled={categoryLocked}
              onClick={() => {
                if (categoryLocked) return;
                patchCommon({ categoryCode: c.code });
              }}
              className={`rounded-md border px-3 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-70 ${
                state.categoryCode === c.code
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border hover:bg-surface-muted'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {categoryLocked ? (
          <p className="mt-2 text-xs text-ink-secondary">
            Listing type can’t be changed after create. Update location below if
            needed.
          </p>
        ) : null}
      </div>

      {catalog.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <>
          <Select
            label="Governorate"
            value={state.governorateId}
            onChange={(e) =>
              patchCommon({
                governorateId: e.target.value,
                cityId: '',
              })
            }
            required
          >
            <option value="">Select governorate</option>
            {(catalog.data?.governorates ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameEn}
              </option>
            ))}
          </Select>

          <Select
            label="City"
            value={state.cityId}
            onChange={(e) => patchCommon({ cityId: e.target.value })}
            required
            disabled={!state.governorateId}
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </Select>

          <p className="text-xs text-ink-secondary">
            Listings are discovered by city today. Optional map coordinates below
            are saved in your draft for a future map pin — they are not sent to
            the API yet.
          </p>

          <details className="rounded-md border border-border bg-surface-muted/40 p-3">
            <summary className="cursor-pointer text-sm font-medium text-ink">
              Map pin (optional, draft only)
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={state.locationLat}
                onChange={(e) =>
                  patchCommon({ locationLat: e.target.value })
                }
                placeholder="e.g. 33.3152"
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={state.locationLng}
                onChange={(e) =>
                  patchCommon({ locationLng: e.target.value })
                }
                placeholder="e.g. 44.3661"
              />
            </div>
          </details>

          {state.cityId && !locationOk ? (
            <p className="text-sm text-error">
              Selected city does not belong to the chosen governorate.
            </p>
          ) : null}
        </>
      )}

      {!state.categoryId && !catalog.isLoading ? (
        <p className="text-sm text-error">
          Listing type catalog not loaded — check API connection.
        </p>
      ) : null}
    </div>
  );
}
