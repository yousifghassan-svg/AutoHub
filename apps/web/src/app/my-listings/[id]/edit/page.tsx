'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Skeleton, TextArea } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import { isPlateListing } from '@/features/listings/domain/marketplace-path';
import { createPlatesRepository } from '@/features/plates/data/plates.repository';
import { createVehiclesRepository } from '@/features/vehicles/data/vehicles.repository';
import { getHttpClient } from '@/lib/api/client';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { status } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currencyCode, setCurrencyCode] = useState('IQD');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [domain, setDomain] = useState<'VEHICLE' | 'PLATE'>('VEHICLE');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/my-listings');
  }, [status, router]);

  const query = useQuery({
    queryKey: ['edit-listing', id],
    enabled: status === 'authenticated' && Boolean(id),
    queryFn: async () => {
      try {
        const vehicle = await createVehiclesRepository(getHttpClient()).getById(id);
        setDomain('VEHICLE');
        setTitle(vehicle.title);
        setDescription(vehicle.description ?? '');
        setPrice(vehicle.price != null ? String(vehicle.price) : '');
        setCurrencyCode(vehicle.currencyCode || 'IQD');
        return vehicle;
      } catch {
        const plate = await createPlatesRepository(getHttpClient()).getById(id);
        setDomain('PLATE');
        setTitle(plate.title);
        setDescription(plate.description ?? '');
        setPrice(plate.price != null ? String(plate.price) : '');
        setCurrencyCode(plate.currencyCode || 'IQD');
        return plate;
      }
    },
  });

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
      };
      const n = Number(price);
      if (Number.isFinite(n) && n > 0) {
        body.primaryPrice = n;
        body.currencyCode = currencyCode || 'IQD';
      }
      if (domain === 'PLATE' || (query.data && isPlateListing(query.data))) {
        await createPlatesRepository(getHttpClient()).update(id, body);
      } else {
        await createVehiclesRepository(getHttpClient()).update(id, body);
      }
      router.replace('/my-listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'bootstrapping' || query.isLoading) {
    return (
      <div className="page-container py-10">
        <Skeleton className="h-10 w-56" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-xl py-10">
      <Link href="/my-listings" className="text-sm font-semibold text-brand">
        ← My listings
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">Edit listing</h1>
      <p className="mt-1 text-sm text-ink-secondary">Updates title, description, and price.</p>

      <form onSubmit={onSave} className="mt-6 space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <CurrencySelect value={currencyCode} onChange={setCurrencyCode} />
        <Input
          label={`Price (${currencyCode})`}
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          <Link href="/my-listings">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
