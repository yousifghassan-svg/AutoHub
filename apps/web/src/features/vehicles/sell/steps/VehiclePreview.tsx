'use client';

import { CATEGORIES } from '@/features/listings/domain/types';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import type { SellStepProps } from '@/features/sell/core/types';
import { asVehicleDomainData } from '../domain-data';

/** Domain summary for review — media/price/location live in PublishStep shell. */
export function VehiclePreview({ state }: SellStepProps) {
  const catalog = useCatalogFilters();
  const data = asVehicleDomainData(state.domainData);

  const categoryLabel =
    CATEGORIES.find((c) => c.code === state.categoryCode)?.label ??
    state.categoryCode;

  const brandLabel =
    catalog.data?.brands.find((b) => b.id === data.brandId)?.nameEn ?? '';
  const modelLabel =
    catalog.data?.models.find((m) => m.id === data.modelId)?.nameEn ?? '';
  const fuelLabel =
    catalog.data?.fuelTypes.find((t) => t.id === data.fuelTypeId)?.nameEn ?? '';
  const transmissionLabel =
    catalog.data?.transmissionTypes.find(
      (t) => t.id === data.transmissionTypeId,
    )?.nameEn ?? '';
  const bodyLabel =
    catalog.data?.bodyTypes.find((t) => t.id === data.bodyTypeId)?.nameEn ??
    '';
  const colorLabel =
    catalog.data?.colors.find((c) => c.id === data.colorId)?.nameEn ?? '';
  const driveLabel =
    catalog.data?.driveTypes?.find((t) => t.id === data.driveTypeId)?.nameEn ??
    '';

  const displayTitle = state.title.trim() || 'Untitled listing';

  const facts = [
    data.year ? { label: 'Year', value: data.year } : null,
    data.mileageKm
      ? {
          label: 'Mileage',
          value: `${Number(data.mileageKm).toLocaleString()} km`,
        }
      : null,
    brandLabel ? { label: 'Make', value: brandLabel } : null,
    modelLabel ? { label: 'Model', value: modelLabel } : null,
    fuelLabel ? { label: 'Fuel', value: fuelLabel } : null,
    transmissionLabel
      ? { label: 'Transmission', value: transmissionLabel }
      : null,
    bodyLabel ? { label: 'Body', value: bodyLabel } : null,
    driveLabel ? { label: 'Drive', value: driveLabel } : null,
    colorLabel ? { label: 'Color', value: colorLabel } : null,
    data.vin ? { label: 'VIN', value: data.vin } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
          {categoryLabel}
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-ink">
          {displayTitle}
        </p>
      </div>

      {facts.length ? (
        <dl className="grid gap-2 sm:grid-cols-2">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-lg bg-surface px-3 py-2 text-sm"
            >
              <dt className="text-xs text-ink-secondary">{fact.label}</dt>
              <dd className="font-medium text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {state.description.trim() ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
            Description
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-secondary">
            {state.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
