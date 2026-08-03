'use client';

import { useMemo } from 'react';
import { Input, Select, TextArea } from '@/components/ui';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import type { SellStepProps } from '@/features/sell/core/types';
import {
  asVehicleDomainData,
  vehicleDetailsRequireCatalogSpecs,
} from '../domain-data';

export function VehicleDetailsStep({
  state,
  patchCommon,
  patchDomain,
}: SellStepProps) {
  const catalog = useCatalogFilters();
  const data = asVehicleDomainData(state.domainData);
  const requireSpecs = vehicleDetailsRequireCatalogSpecs(state.categoryCode);

  const models = useMemo(
    () =>
      (catalog.data?.models ?? []).filter(
        (m) => !data.brandId || m.brandId === data.brandId,
      ),
    [catalog.data?.models, data.brandId],
  );

  const driveTypes = catalog.data?.driveTypes ?? [];

  return (
    <div className="space-y-4">
      <Input
        label="Title"
        value={state.title}
        onChange={(e) => patchCommon({ title: e.target.value })}
        required
        autoComplete="off"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Year"
          type="number"
          value={data.year}
          onChange={(e) => patchDomain({ year: e.target.value })}
          required
          min={1950}
          max={new Date().getFullYear() + 1}
        />
        <Input
          label="Mileage (km)"
          type="number"
          value={data.mileageKm}
          onChange={(e) => patchDomain({ mileageKm: e.target.value })}
          required={requireSpecs}
          min={0}
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
          required={requireSpecs}
        >
          <option value="">
            {requireSpecs ? 'Select fuel' : 'Any / not set'}
          </option>
          {(catalog.data?.fuelTypes ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameEn}
            </option>
          ))}
        </Select>
        <Select
          label="Transmission"
          value={data.transmissionTypeId}
          onChange={(e) =>
            patchDomain({ transmissionTypeId: e.target.value })
          }
          required={requireSpecs}
        >
          <option value="">
            {requireSpecs ? 'Select transmission' : 'Any / not set'}
          </option>
          {(catalog.data?.transmissionTypes ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameEn}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Body type"
          value={data.bodyTypeId}
          onChange={(e) => patchDomain({ bodyTypeId: e.target.value })}
        >
          <option value="">Any / not set</option>
          {(catalog.data?.bodyTypes ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameEn}
            </option>
          ))}
        </Select>
        {driveTypes.length > 0 ? (
          <Select
            label="Drive type"
            value={data.driveTypeId}
            onChange={(e) => patchDomain({ driveTypeId: e.target.value })}
          >
            <option value="">Any / not set</option>
            {driveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>
        ) : null}
      </div>

      <Select
        label="Color"
        value={data.colorId}
        onChange={(e) => patchDomain({ colorId: e.target.value })}
      >
        <option value="">Any / not set</option>
        {(catalog.data?.colors ?? []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.nameEn}
          </option>
        ))}
      </Select>

      <Input
        label="VIN (optional)"
        value={data.vin}
        onChange={(e) => patchDomain({ vin: e.target.value })}
        autoComplete="off"
        placeholder="Improves listing trust"
      />

      <TextArea
        label="Description"
        value={state.description}
        onChange={(e) => patchCommon({ description: e.target.value })}
        required
      />
      <p className="text-xs text-ink-secondary">
        Minimum 10 characters
        {requireSpecs
          ? '. Fuel, transmission, and mileage are required for this category.'
          : '.'}
      </p>
    </div>
  );
}
