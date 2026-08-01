'use client';

import { useEffect, useMemo } from 'react';
import { Select, Skeleton } from '@/components/ui';
import { CATEGORIES } from '@/features/listings/domain/types';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import type { SellStepProps } from '../../core/types';

export function CategoryStep({ state, patchCommon }: SellStepProps) {
  const catalog = useCatalogFilters();

  useEffect(() => {
    if (!catalog.data?.categories) return;
    const match = catalog.data.categories.find((c) => c.code === state.categoryCode);
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

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-ink-secondary">Category</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() =>
                patchCommon({
                  categoryCode: c.code,
                })
              }
              className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
                state.categoryCode === c.code
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border hover:bg-surface-muted'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
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
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </Select>
        </>
      )}

      {!state.categoryId && !catalog.isLoading ? (
        <p className="text-sm text-error">
          Category catalog not loaded — check API connection.
        </p>
      ) : null}
    </div>
  );
}
