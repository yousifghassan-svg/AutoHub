'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button, Input, TextArea } from '@/components/ui';
import { CATEGORIES } from '@/features/listings/domain/types';
import { useListingMutations } from '@/features/listings/hooks/useListings';
import { config } from '@/lib/config';

const steps = ['Category', 'Details', 'Price', 'Description', 'Submit'] as const;

export default function SellWizardPage() {
  const router = useRouter();
  const { status, authMode } = useAuth();
  const { create, changeStatus } = useListingMutations();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryCode: 'CAR',
    categoryId: '',
    cityId: '',
    title: '',
    description: '',
    primaryPrice: '',
    year: String(new Date().getFullYear()),
    mileageKm: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'needs_profile') router.replace('/profile-setup');
  }, [status, router]);

  const pct = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const submit = async () => {
    setError(null);
    if (authMode === 'mock') {
      setError(
        'Mock auth cannot call protected listing APIs. Set NEXT_PUBLIC_AUTH_MODE=api with Firebase, or use Expo mock sell flow.',
      );
      return;
    }
    try {
      const created = await create.mutateAsync({
        categoryId: form.categoryId || form.categoryCode,
        cityId: form.cityId,
        title: form.title,
        description: form.description,
        primaryPrice: form.primaryPrice ? Number(form.primaryPrice) : undefined,
        language: 'ar',
        carDetails:
          form.categoryCode === 'CAR'
            ? {
                year: Number(form.year) || undefined,
                mileageKm: form.mileageKm ? Number(form.mileageKm) : undefined,
              }
            : undefined,
      });
      await changeStatus.mutateAsync({ id: created.id, status: 'PENDING' });
      router.push('/my-listings');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    }
  };

  return (
    <div className="page-container max-w-2xl py-10">
      <h1 className="section-title">Create listing</h1>
      <p className="mt-2 text-ink-secondary">
        Wizard posts to <code className="text-brand">POST /v1/listings</code> then submits for
        review.
      </p>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm font-medium text-ink-secondary">
        Step {step + 1}: {steps[step]}
      </p>

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6 shadow-card">
        {step === 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setForm((f) => ({ ...f, categoryCode: c.code }))}
                className={`rounded-md border px-3 py-3 text-sm font-semibold ${
                  form.categoryCode === c.code
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-border'
                }`}
              >
                {c.label}
              </button>
            ))}
            <Input
              label="Category ID (from catalog seed)"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              placeholder="cuid from database"
            />
            <Input
              label="City ID"
              value={form.cityId}
              onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value }))}
              required
            />
          </div>
        ) : null}

        {step === 1 ? (
          <>
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Input
              label="Year"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
            />
            <Input
              label="Mileage (km)"
              value={form.mileageKm}
              onChange={(e) => setForm((f) => ({ ...f, mileageKm: e.target.value }))}
            />
          </>
        ) : null}

        {step === 2 ? (
          <Input
            label="Price (IQD)"
            type="number"
            value={form.primaryPrice}
            onChange={(e) => setForm((f) => ({ ...f, primaryPrice: e.target.value }))}
          />
        ) : null}

        {step === 3 ? (
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        ) : null}

        {step === 4 ? (
          <div className="space-y-2 text-sm text-ink-secondary">
            <p>
              <strong className="text-ink">{form.title || 'Untitled'}</strong>
            </p>
            <p>
              {form.categoryCode} · {form.primaryPrice || '—'} IQD
            </p>
            <p>{form.description}</p>
            {authMode === 'mock' ? (
              <p className="rounded-md bg-brand-soft p-3 text-brand">
                Auth mode is mock ({config.authMode}). Use real API auth to submit.
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="flex justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              disabled={create.isPending || changeStatus.isPending}
              onClick={() => void submit()}
            >
              Submit for review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
