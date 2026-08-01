'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { CATEGORIES } from '@/features/listings/domain/types';
import { mediaRepository } from '@/features/media';
import { formatMoney } from '@/features/currencies/lib/format-money';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { mediaPublicUrl } from '@/lib/media/url';
import type { SellStepProps } from '@/features/sell/core/types';
import { asVehicleDomainData } from '../domain-data';

export function VehiclePreview({ state }: SellStepProps) {
  const catalog = useCatalogFilters();
  const data = asVehicleDomainData(state.domainData);

  const categoryLabel =
    CATEGORIES.find((c) => c.code === state.categoryCode)?.label ??
    state.categoryCode;

  const cityLabel =
    catalog.data?.cities.find((c) => c.id === state.cityId)?.nameEn ??
    state.cityId;

  const brandLabel =
    catalog.data?.brands.find((b) => b.id === data.brandId)?.nameEn ?? '';

  const modelLabel =
    catalog.data?.models.find((m) => m.id === data.modelId)?.nameEn ?? '';

  const displayTitle = state.title.trim() || 'Untitled';
  const previewAssetIds = useMemo(
    () => [...state.imageAssetIds, ...state.videoAssetIds],
    [state.imageAssetIds, state.videoAssetIds],
  );

  const previewAssets = useQueries({
    queries: previewAssetIds.map((id) => ({
      queryKey: ['media', id],
      queryFn: () => mediaRepository.getById(id),
      enabled: Boolean(id),
      staleTime: 60_000,
    })),
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-sm">
        <p className="font-display text-xl font-semibold text-ink">
          {displayTitle}
        </p>
        <p className="text-ink-secondary">
          {categoryLabel} · {cityLabel}
          {brandLabel ? ` · ${brandLabel}` : ''}
          {modelLabel ? ` ${modelLabel}` : ''}
        </p>
        <p className="text-ink-secondary">
          {data.year}
          {data.mileageKm
            ? ` · ${Number(data.mileageKm).toLocaleString()} km`
            : ''}
        </p>
        <p className="text-lg font-semibold text-brand">
          {state.primaryPrice
            ? formatMoney(
                Number(state.primaryPrice),
                state.currencyCode || 'IQD',
                'en',
              )
            : '—'}
        </p>
        <p className="whitespace-pre-wrap text-ink-secondary">
          {state.description}
        </p>
      </div>

      {previewAssetIds.length ? (
        <div>
          <p className="mb-2 text-sm font-medium text-ink-secondary">Media</p>
          <div className="flex flex-wrap gap-2">
            {previewAssets.map((q, index) => {
              const asset = q.data;
              const thumb =
                asset?.urls?.thumbnail ??
                mediaPublicUrl(
                  asset?.variants?.find((v) => v.kind === 'THUMBNAIL')?.r2Key,
                ) ??
                mediaPublicUrl(asset?.originalKey);
              const assetId = previewAssetIds[index];
              const isVideo =
                Boolean(assetId) && state.videoAssetIds.includes(assetId!);
              return (
                <div
                  key={assetId ?? index}
                  className="relative h-20 w-20 overflow-hidden rounded-md border border-border bg-surface-muted"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-secondary">
                      {q.isLoading ? '…' : isVideo ? 'Video' : 'Photo'}
                    </div>
                  )}
                  {isVideo ? (
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
                      VIDEO
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-secondary">No media uploaded.</p>
      )}
    </div>
  );
}
