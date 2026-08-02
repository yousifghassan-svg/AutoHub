'use client';

import { useMemo } from 'react';
import { Input, Select, TextArea } from '@/components/ui';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import type { SellStepProps } from '@/features/sell/core/types';
import { asVehicleDomainData } from '../domain-data';
import { VEHICLE_FEATURE_OPTIONS } from '../features-catalog';

export function VehicleDetailsStep({
  state,
  patchCommon,
  patchDomain,
}: SellStepProps) {
  const catalog = useCatalogFilters();
  const data = asVehicleDomainData(state.domainData);

  const models = useMemo(
    () =>
      (catalog.data?.models ?? []).filter(
        (m) => !data.brandId || m.brandId === data.brandId,
      ),
    [catalog.data?.models, data.brandId],
  );

  const toggleFeature = (feature: string) => {
    const next = data.features.includes(feature)
      ? data.features.filter((f) => f !== feature)
      : [...data.features, feature];
    patchDomain({ features: next });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Title"
        value={state.title}
        onChange={(e) => patchCommon({ title: e.target.value })}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Year"
          type="number"
          value={data.year}
          onChange={(e) => patchDomain({ year: e.target.value })}
          required
        />
        <Input
          label="Mileage (km)"
          type="number"
          value={data.mileageKm}
          onChange={(e) => patchDomain({ mileageKm: e.target.value })}
        />
      </div>
      <Select
        label="Brand"
        value={data.brandId}
        onChange={(e) =>
          patchDomain({ brandId: e.target.value, modelId: '' })
        }
      >
        <option value="">Select brand (optional)</option>
        {(catalog.data?.brands ?? []).map((b) => (
          <option key={b.id} value={b.id}>
            {b.nameEn}
          </option>
        ))}
      </Select>
      <Select
        label="Model"
        value={data.modelId}
        onChange={(e) => patchDomain({ modelId: e.target.value })}
        disabled={!data.brandId}
      >
        <option value="">Select model (optional)</option>
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nameEn}
          </option>
        ))}
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Fuel"
          value={data.fuelTypeId}
          onChange={(e) => patchDomain({ fuelTypeId: e.target.value })}
        >
          <option value="">Select fuel</option>
          {(catalog.data?.fuelTypes ?? []).map((f) => (
            <option key={f.id} value={f.id}>
              {f.nameEn}
            </option>
          ))}
        </Select>
        <Select
          label="Transmission"
          value={data.transmissionTypeId}
          onChange={(e) => patchDomain({ transmissionTypeId: e.target.value })}
        >
          <option value="">Select transmission</option>
          {(catalog.data?.transmissionTypes ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameEn}
            </option>
          ))}
        </Select>
        <Select
          label="Body type"
          value={data.bodyTypeId}
          onChange={(e) => patchDomain({ bodyTypeId: e.target.value })}
        >
          <option value="">Select body</option>
          {(catalog.data?.bodyTypes ?? []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.nameEn}
            </option>
          ))}
        </Select>
        <Select
          label="Drive"
          value={data.driveTypeId}
          onChange={(e) => patchDomain({ driveTypeId: e.target.value })}
        >
          <option value="">Select drive</option>
          {(catalog.data?.driveTypes ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameEn}
            </option>
          ))}
        </Select>
        <Select
          label="Color"
          value={data.colorId}
          onChange={(e) => patchDomain({ colorId: e.target.value })}
        >
          <option value="">Select color</option>
          {(catalog.data?.colors ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </Select>
        <Select
          label="Engine type"
          value={data.engineTypeId}
          onChange={(e) => patchDomain({ engineTypeId: e.target.value })}
        >
          <option value="">Select engine</option>
          {(catalog.data?.engineTypes ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.nameEn}
            </option>
          ))}
        </Select>
        <Input
          label="Engine size (cc)"
          type="number"
          value={data.engineSizeCc}
          onChange={(e) => patchDomain({ engineSizeCc: e.target.value })}
        />
        <Input
          label="VIN (optional)"
          value={data.vin}
          onChange={(e) => patchDomain({ vin: e.target.value.toUpperCase() })}
          maxLength={17}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Features</p>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_FEATURE_OPTIONS.map((feature) => {
            const selected = data.features.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={
                  selected
                    ? 'rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white'
                    : 'rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-ink-secondary'
                }
              >
                {feature}
              </button>
            );
          })}
        </div>
      </div>
      <TextArea
        label="Description"
        value={state.description}
        onChange={(e) => patchCommon({ description: e.target.value })}
      />
      <p className="text-xs text-ink-secondary">Minimum 10 characters</p>
    </div>
  );
}
