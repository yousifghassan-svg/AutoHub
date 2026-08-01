'use client';

import { useMemo } from 'react';
import { Input, Select, TextArea } from '@/components/ui';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import type { SellStepProps } from '@/features/sell/core/types';
import { asVehicleDomainData } from '../domain-data';

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
      <TextArea
        label="Description"
        value={state.description}
        onChange={(e) => patchCommon({ description: e.target.value })}
      />
      <p className="text-xs text-ink-secondary">Minimum 10 characters</p>
    </div>
  );
}
