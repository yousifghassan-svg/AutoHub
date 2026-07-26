'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { VehicleMediaPanel } from '@/features/vehicles/components/VehicleMediaPanel';
import { emptyVehicleForm, type VehicleFormValues } from '@/features/vehicles/domain/types';
import { formToPayload, mapListingToForm } from '@/features/vehicles/lib/map-listing-to-form';
import { useUnsavedWarning } from '@/features/vehicles/hooks/useUnsavedWarning';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Button,
  ErrorState,
  PageHeader,
  Skeleton,
  useToast,
} from '@/components/ui';

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [values, setValues] = useState<VehicleFormValues>(emptyVehicleForm());
  const [dirty, setDirty] = useState(false);
  const [ready, setReady] = useState(false);
  useUnsavedWarning(dirty);

  const query = useQuery({
    queryKey: ['admin', 'vehicles', params.id],
    queryFn: () => adminApi.vehicles.get(params.id, true),
  });

  useEffect(() => {
    if (!query.data || ready) return;
    setValues(mapListingToForm(query.data));
    setReady(true);
  }, [query.data, ready]);

  const save = useMutation({
    mutationFn: () => adminApi.vehicles.update(params.id, formToPayload(values)),
    onSuccess: () => {
      setDirty(false);
      toast('Vehicle saved', 'success');
      void qc.invalidateQueries({ queryKey: ['admin', 'vehicles', params.id] });
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Save failed', 'error'),
  });

  if (query.isLoading || !ready) {
    return <Skeleton className="h-96" />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : 'Vehicle not found'}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit vehicle"
        description={values.title || params.id}
        action={
          <div className="flex gap-2">
            <Link href={`/vehicles/${params.id}`}>
              <Button variant="secondary">Details</Button>
            </Link>
            <Link href="/vehicles">
              <Button variant="ghost">List</Button>
            </Link>
          </div>
        }
      />
      <VehicleForm
        mode="edit"
        values={values}
        submitting={save.isPending}
        submitLabel="Save changes"
        onChange={(next) => {
          setValues(next);
          setDirty(true);
        }}
        onSubmit={() => save.mutate()}
      />
      <VehicleMediaPanel listingId={params.id} media={query.data.media ?? []} />
    </div>
  );
}
