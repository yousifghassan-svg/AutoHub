'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { isPlateListing } from '@/features/listings/domain/marketplace-path';
import { createPlatesRepository } from '@/features/plates/data/plates.repository';
import { createVehiclesRepository } from '@/features/vehicles/data/vehicles.repository';
import { getHttpClient } from '@/lib/api/client';
import { Button, Input, TextArea } from '@/components/ui';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import { useState } from 'react';
import Link from 'next/link';

/**
 * Vehicles open the sell wizard (server draft). Plates keep thin edit form.
 */
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
  const [isPlate, setIsPlate] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/my-listings');
  }, [status, router]);

  const query = useQuery({
    queryKey: ['edit-listing', id],
    enabled: status === 'authenticated' && Boolean(id),
    queryFn: async () => {
      try {
        const vehicle = await createVehiclesRepository(getHttpClient()).getById(id);
        if (!isPlateListing(vehicle)) {
          router.replace(`/sell?listingId=${encodeURIComponent(id)}`);
          return vehicle;
        }
      } catch {
        // try plate
      }
      const plate = await createPlatesRepository(getHttpClient()).getById(id);
      setIsPlate(true);
      setTitle(plate.title);
      setDescription(plate.description ?? '');
      setPrice(plate.price != null ? String(plate.price) : '');
      setCurrencyCode(plate.currencyCode || 'IQD');
      return plate;
    },
  });

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlate) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
      };
      if (price) {
        body.primaryPrice = Number(price);
        body.currencyCode = currencyCode;
      }
      await createPlatesRepository(getHttpClient()).update(id, body);
      router.push('/my-listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'bootstrapping' || query.isLoading) {
    return (
      <div className="page-container max-w-xl space-y-4 py-10">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isPlate) {
    return (
      <div className="page-container max-w-xl space-y-4 py-10">
        <Skeleton className="h-10 w-48" />
        <p className="text-sm text-ink-secondary">Opening listing wizard…</p>
      </div>
    );
  }

  return (
    <div className="page-container max-w-xl py-10">
      <Link href="/my-listings" className="text-sm text-brand">
        ← My listings
      </Link>
      <h1 className="section-title mt-4">Edit plate listing</h1>
      <form onSubmit={onSave} className="mt-6 space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <CurrencySelect value={currencyCode} onChange={setCurrencyCode} />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  );
}
