'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { emptyVehicleForm, type VehicleFormValues } from '@/features/vehicles/domain/types';
import { formToPayload } from '@/features/vehicles/lib/map-listing-to-form';
import { useUnsavedWarning } from '@/features/vehicles/hooks/useUnsavedWarning';
import { useCatalogFilters } from '@/features/vehicles/hooks/useCatalogFilters';
import { adminApi } from '@/lib/api/admin.repository';
import { Button, PageHeader, useToast } from '@/components/ui';

export default function NewVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();
  const catalog = useCatalogFilters();
  const [values, setValues] = useState<VehicleFormValues>(emptyVehicleForm);
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  const create = useMutation({
    mutationFn: async () => {
      const payload = formToPayload(values);
      const carCategory =
        catalog.data?.categories.find((c) => c.code === 'CAR')?.id ?? payload.categoryId;
      if (!payload.cityId) throw new Error('City is required');
      if (!payload.title || payload.title.length < 3) throw new Error('Title is required');
      if (!payload.description || payload.description.length < 10) {
        throw new Error('Description must be at least 10 characters');
      }
      if (!payload.carDetails?.year) throw new Error('Year is required');
      return adminApi.vehicles.create({
        ...payload,
        categoryId: carCategory,
      });
    },
    onSuccess: (listing) => {
      setDirty(false);
      toast('Vehicle created', 'success');
      router.push(`/vehicles/${listing.id}/edit`);
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Create failed', 'error'),
  });

  return (
    <div>
      <PageHeader
        title="New vehicle"
        description="Create a marketplace vehicle from the admin panel."
        action={
          <Link href="/vehicles">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
      <VehicleForm
        mode="create"
        values={values}
        submitting={create.isPending}
        submitLabel="Create vehicle"
        onChange={(next) => {
          setValues(next);
          setDirty(true);
        }}
        onSubmit={() => create.mutate()}
      />
    </div>
  );
}
