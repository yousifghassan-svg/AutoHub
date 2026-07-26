'use client';

import { useMemo } from 'react';
import { Button, Card, Input, Select, TextArea } from '@/components/ui';
import type { VehicleFormValues } from '../domain/types';
import { useCatalogFilters } from '../hooks/useCatalogFilters';

const STATUSES = ['DRAFT', 'PENDING', 'ACTIVE', 'SOLD', 'ARCHIVED', 'REJECTED'] as const;

export function VehicleForm({
  values,
  onChange,
  onSubmit,
  submitting,
  submitLabel = 'Save vehicle',
  mode = 'create',
}: {
  values: VehicleFormValues;
  onChange: (next: VehicleFormValues) => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  mode?: 'create' | 'edit';
}) {
  const catalog = useCatalogFilters();
  const set = <K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) =>
    onChange({ ...values, [key]: value });

  const models = useMemo(
    () => (catalog.data?.models ?? []).filter((m) => !values.brandId || m.brandId === values.brandId),
    [catalog.data?.models, values.brandId],
  );
  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !values.governorateId || c.governorateId === values.governorateId,
      ),
    [catalog.data?.cities, values.governorateId],
  );

  const carCategoryId =
    catalog.data?.categories.find((c) => c.code === 'CAR')?.id ?? values.categoryId;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Basics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Vehicle title"
            required
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
          />
          <Select
            label="Status"
            value={values.status}
            onChange={(e) => set('status', e.target.value as VehicleFormValues['status'])}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <TextArea
          label="Description"
          required
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Category"
            value={values.categoryId || carCategoryId}
            onChange={(e) => set('categoryId', e.target.value)}
          >
            <option value="">Select category</option>
            {(catalog.data?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 pt-7 text-sm">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(e) => set('isFeatured', e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm">
            <input
              type="checkbox"
              checked={values.isVerified}
              onChange={(e) => set('isVerified', e.target.checked)}
            />
            Verified
          </label>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Specifications</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Brand"
            value={values.brandId}
            onChange={(e) => onChange({ ...values, brandId: e.target.value, modelId: '' })}
          >
            <option value="">Any</option>
            {(catalog.data?.brands ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameEn}
              </option>
            ))}
          </Select>
          <Select
            label="Model"
            value={values.modelId}
            onChange={(e) => set('modelId', e.target.value)}
          >
            <option value="">Any</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameEn}
              </option>
            ))}
          </Select>
          <Input label="Trim" value={values.trim} onChange={(e) => set('trim', e.target.value)} />
          <Input
            label="Year"
            type="number"
            required
            value={values.year}
            onChange={(e) => set('year', e.target.value)}
          />
          <Input
            label="Mileage (km)"
            type="number"
            value={values.mileageKm}
            onChange={(e) => set('mileageKm', e.target.value)}
          />
          <Input label="VIN" value={values.vin} onChange={(e) => set('vin', e.target.value)} />
          <Select
            label="Fuel"
            value={values.fuelTypeId}
            onChange={(e) => set('fuelTypeId', e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.fuelTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>
          <Select
            label="Transmission"
            value={values.transmissionTypeId}
            onChange={(e) => set('transmissionTypeId', e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.transmissionTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>
          <Select
            label="Drive type"
            value={values.driveTypeId}
            onChange={(e) => set('driveTypeId', e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.driveTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>
          <Select
            label="Body type"
            value={values.bodyTypeId}
            onChange={(e) => set('bodyTypeId', e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.bodyTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>
          <Select
            label="Engine"
            value={values.engineTypeId}
            onChange={(e) => set('engineTypeId', e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.engineTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>
          <Input
            label="Engine size (cc)"
            type="number"
            value={values.engineSizeCc}
            onChange={(e) => set('engineSizeCc', e.target.value)}
          />
          <Select
            label="Exterior color"
            value={values.colorId}
            onChange={(e) => set('colorId', e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.colors ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </Select>
          <Input
            label="Interior color"
            value={values.interiorColor}
            onChange={(e) => set('interiorColor', e.target.value)}
          />
          <Input
            label="Doors"
            type="number"
            value={values.doors}
            onChange={(e) => set('doors', e.target.value)}
          />
          <Input
            label="Seats"
            type="number"
            value={values.seats}
            onChange={(e) => set('seats', e.target.value)}
          />
          <Select
            label="Condition"
            value={values.conditionTypeId}
            onChange={(e) => set('conditionTypeId', e.target.value)}
          >
            <option value="">Any</option>
            {(catalog.data?.conditionTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Pricing & seller</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label={`Price (${values.currencyCode || 'IQD'})`}
            type="number"
            value={values.primaryPrice}
            onChange={(e) => set('primaryPrice', e.target.value)}
          />
          <Select
            label="Currency"
            value={values.currencyCode}
            onChange={(e) => set('currencyCode', e.target.value)}
          >
            <option value="IQD">IQD — Iraqi Dinar</option>
            <option value="USD">USD — US Dollar</option>
          </Select>
          <Input
            label="Seller user ID"
            value={values.sellerId}
            onChange={(e) => set('sellerId', e.target.value)}
            placeholder="Optional — defaults to admin"
          />
          <Input
            label="Dealer org ID (optional)"
            value={values.dealerId}
            onChange={(e) => set('dealerId', e.target.value)}
            placeholder="Seller should be a dealer member"
          />
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Location</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Governorate"
            value={values.governorateId}
            onChange={(e) =>
              onChange({ ...values, governorateId: e.target.value, cityId: '' })
            }
          >
            <option value="">Select</option>
            {(catalog.data?.governorates ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameEn}
              </option>
            ))}
          </Select>
          <Select
            label="City"
            value={values.cityId}
            onChange={(e) => set('cityId', e.target.value)}
            required
          >
            <option value="">Select</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </Select>
          <Input
            label="Location text"
            value={values.locationText}
            onChange={(e) => set('locationText', e.target.value)}
          />
          <Input
            label="Latitude"
            value={values.latitude}
            onChange={(e) => set('latitude', e.target.value)}
          />
          <Input
            label="Longitude"
            value={values.longitude}
            onChange={(e) => set('longitude', e.target.value)}
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
        {mode === 'edit' ? (
          <p className="self-center text-xs text-ink-secondary">
            Unsaved changes are warned before leaving the page.
          </p>
        ) : null}
      </div>
    </form>
  );
}
