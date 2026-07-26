'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button, Input, Select, Skeleton, TextArea } from '@/components/ui';
import {
  CATEGORIES,
  type ListingCategoryCode,
} from '@/features/listings/domain/types';
import { useDomainMutations } from '@/features/listings/hooks/useDomainMutations';
import { mediaRepository } from '@/features/media';
import { MediaUploader } from '@/features/media';
import {
  DEFAULT_PLATE_FORM,
  LicensePlate,
  PlateEditor,
  plateFormToApiDetails,
  type PlateFormState,
} from '@/features/plates';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import { formatMoney } from '@/features/currencies/lib/format-money';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { mediaPublicUrl } from '@/lib/media/url';
import { config } from '@/lib/config';

const DRAFT_KEY = 'autohub.sell.draft';
const DRAFT_VERSION = 1;

const STEPS = [
  'Category & location',
  'Details',
  'Media',
  'Price',
  'Preview',
  'Publish',
] as const;

type SellFormState = {
  categoryCode: ListingCategoryCode;
  categoryId: string;
  governorateId: string;
  cityId: string;
  title: string;
  description: string;
  primaryPrice: string;
  currencyCode: string;
  year: string;
  mileageKm: string;
  brandId: string;
  modelId: string;
};

type SellDraft = {
  version: number;
  step: number;
  form: SellFormState;
  plate: PlateFormState;
  imageAssetIds: string[];
  videoAssetIds: string[];
};

const DEFAULT_FORM: SellFormState = {
  categoryCode: 'CAR',
  categoryId: '',
  governorateId: '',
  cityId: '',
  title: '',
  description: '',
  primaryPrice: '',
  currencyCode: 'IQD',
  year: String(new Date().getFullYear()),
  mileageKm: '',
  brandId: '',
  modelId: '',
};

function isPlateFieldsValid(plate: PlateFormState): boolean {
  return Boolean(
    plate.code.trim() && plate.letter.trim() && plate.number.trim(),
  );
}

function plateTitle(plate: PlateFormState): string {
  return `${plate.governorate} plate ${plate.code} ${plate.letter} ${plate.number}`;
}

function stepIsValid(
  step: number,
  form: SellFormState,
  plate: PlateFormState,
  isPlate: boolean,
): boolean {
  switch (step) {
    case 0:
      return Boolean(form.categoryId && form.cityId);
    case 1:
      if (isPlate) {
        return isPlateFieldsValid(plate) && form.description.trim().length >= 10;
      }
      return (
        form.title.trim().length >= 3 &&
        Boolean(form.year) &&
        Number(form.year) >= 1950 &&
        form.description.trim().length >= 10
      );
    case 2:
      return true;
    case 3:
      return Boolean(form.primaryPrice && Number(form.primaryPrice) > 0);
    case 4:
    case 5:
      return true;
    default:
      return false;
  }
}

function buildCreateVehicleBody(form: SellFormState): Record<string, unknown> {
  const vehicleDetails = {
    year: Number(form.year) || undefined,
    mileageKm: form.mileageKm ? Number(form.mileageKm) : undefined,
    brandId: form.brandId || undefined,
    modelId: form.modelId || undefined,
  };

  return {
    categoryId: form.categoryId,
    cityId: form.cityId,
    title: form.title.trim(),
    description: form.description.trim(),
    primaryPrice: Number(form.primaryPrice),
    currencyCode: form.currencyCode || 'IQD',
    language: 'ar',
    vehicleDetails,
  };
}

function buildCreatePlateBody(
  form: SellFormState,
  plate: PlateFormState,
): Record<string, unknown> {
  const details = plateFormToApiDetails(plate);
  return {
    categoryId: form.categoryId,
    cityId: form.cityId,
    title: form.title.trim() || plateTitle(plate),
    description: form.description.trim(),
    primaryPrice: Number(form.primaryPrice),
    currencyCode: form.currencyCode || 'IQD',
    language: 'ar',
    formatCode: details.formatCode,
    regionCode: details.regionCode,
    series: details.series,
    number: details.number,
    plateType: details.plateType,
  };
}

export default function SellWizardPage() {
  const router = useRouter();
  const { status, authMode } = useAuth();
  const catalog = useCatalogFilters();
  const { createVehicle, createPlate, changeStatus, addMedia } = useDomainMutations();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [plate, setPlate] = useState<PlateFormState>(DEFAULT_PLATE_FORM);
  const [form, setForm] = useState<SellFormState>(DEFAULT_FORM);
  const [imageAssetIds, setImageAssetIds] = useState<string[]>([]);
  const [videoAssetIds, setVideoAssetIds] = useState<string[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPlate = form.categoryCode === 'PLATE';
  const isVehicle = !isPlate;
  const pct = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  const canNext = stepIsValid(step, form, plate, isPlate);
  const busy =
    createVehicle.isPending ||
    createPlate.isPending ||
    changeStatus.isPending ||
    addMedia.isPending;

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'needs_profile') router.replace('/profile-setup');
  }, [status, router]);

  useEffect(() => {
    if (draftRestored) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        setDraftRestored(true);
        return;
      }
      const draft = JSON.parse(raw) as SellDraft;
      if (draft.version === DRAFT_VERSION) {
        setStep(Math.min(draft.step, STEPS.length - 1));
        setForm({ ...DEFAULT_FORM, ...draft.form });
        setPlate({ ...DEFAULT_PLATE_FORM, ...draft.plate });
        setImageAssetIds(draft.imageAssetIds ?? []);
        setVideoAssetIds(draft.videoAssetIds ?? []);
      }
    } catch {
      /* ignore corrupt draft */
    } finally {
      setDraftRestored(true);
    }
  }, [draftRestored]);

  useEffect(() => {
    if (!draftRestored) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const draft: SellDraft = {
        version: DRAFT_VERSION,
        step,
        form,
        plate,
        imageAssetIds,
        videoAssetIds,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draftRestored, step, form, plate, imageAssetIds, videoAssetIds]);

  useEffect(() => {
    if (!catalog.data?.categories) return;
    const match = catalog.data.categories.find((c) => c.code === form.categoryCode);
    if (match && match.id !== form.categoryId) {
      setForm((f) => ({ ...f, categoryId: match.id }));
    }
  }, [form.categoryCode, form.categoryId, catalog.data?.categories]);

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !form.governorateId || c.governorateId === form.governorateId,
      ),
    [catalog.data?.cities, form.governorateId],
  );

  const models = useMemo(
    () =>
      (catalog.data?.models ?? []).filter(
        (m) => !form.brandId || m.brandId === form.brandId,
      ),
    [catalog.data?.models, form.brandId],
  );

  const categoryLabel = useMemo(
    () => CATEGORIES.find((c) => c.code === form.categoryCode)?.label ?? form.categoryCode,
    [form.categoryCode],
  );

  const cityLabel = useMemo(() => {
    const city = catalog.data?.cities.find((c) => c.id === form.cityId);
    return city?.nameEn ?? form.cityId;
  }, [catalog.data?.cities, form.cityId]);

  const brandLabel = useMemo(() => {
    const brand = catalog.data?.brands.find((b) => b.id === form.brandId);
    return brand?.nameEn ?? '';
  }, [catalog.data?.brands, form.brandId]);

  const modelLabel = useMemo(() => {
    const model = catalog.data?.models.find((m) => m.id === form.modelId);
    return model?.nameEn ?? '';
  }, [catalog.data?.models, form.modelId]);

  const previewAssetIds = useMemo(
    () => [...imageAssetIds, ...videoAssetIds],
    [imageAssetIds, videoAssetIds],
  );

  const previewAssets = useQueries({
    queries: previewAssetIds.map((id) => ({
      queryKey: ['media', id],
      queryFn: () => mediaRepository.getById(id),
      enabled: step >= 4 && Boolean(id),
      staleTime: 60_000,
    })),
  });

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const attachMedia = useCallback(
    async (listingId: string) => {
      const assets = [
        ...imageAssetIds.map((mediaAssetId) => ({
          mediaAssetId,
          mediaType: 'IMAGE' as const,
        })),
        ...videoAssetIds.map((mediaAssetId) => ({
          mediaAssetId,
          mediaType: 'VIDEO' as const,
        })),
      ];
      for (let i = 0; i < assets.length; i++) {
        const item = assets[i];
        if (!item) continue;
        await addMedia.mutateAsync({
          listingId,
          mediaAssetId: item.mediaAssetId,
          mediaType: item.mediaType,
          sortOrder: i,
        });
      }
    },
    [addMedia, imageAssetIds, videoAssetIds],
  );

  const publish = useCallback(
    async (submitForReview: boolean) => {
      setError(null);
      if (authMode === 'mock') {
        setError(
          'Mock auth cannot call protected listing APIs. Set NEXT_PUBLIC_AUTH_MODE=api with Firebase, or use Expo mock sell flow.',
        );
        return;
      }
      if (!stepIsValid(1, form, plate, isPlate) || !stepIsValid(3, form, plate, isPlate)) {
        setError('Complete required fields before publishing.');
        return;
      }

      try {
        const created = isPlate
          ? await createPlate.mutateAsync(buildCreatePlateBody(form, plate))
          : await createVehicle.mutateAsync(buildCreateVehicleBody(form));
        if (imageAssetIds.length || videoAssetIds.length) {
          await attachMedia(created.id);
        }
        if (submitForReview) {
          await changeStatus.mutateAsync({
            id: created.id,
            status: 'PENDING',
            domain: isPlate ? 'PLATE' : 'VEHICLE',
          });
        }
        clearDraft();
        router.push('/my-listings');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Publish failed');
      }
    },
    [
      attachMedia,
      authMode,
      changeStatus,
      clearDraft,
      createPlate,
      createVehicle,
      form,
      imageAssetIds.length,
      isPlate,
      plate,
      router,
      videoAssetIds.length,
    ],
  );

  const displayTitle =
    form.title.trim() || (isPlate ? plateTitle(plate) : 'Untitled');

  if (status === 'bootstrapping' || !draftRestored) {
    return (
      <div className="page-container max-w-2xl space-y-4 py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl py-10">
      <h1 className="section-title">Create listing</h1>
      <p className="mt-2 text-ink-secondary">
        Multi-step wizard with autosaved draft. Progress is saved locally as you go.
      </p>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <p className="font-medium text-ink-secondary">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <p className="text-xs text-ink-secondary">Draft saved automatically</p>
      </div>

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6 shadow-card">
        {step === 0 ? (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-ink-secondary">Category</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        categoryCode: c.code,
                        brandId: '',
                        modelId: '',
                      }))
                    }
                    className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
                      form.categoryCode === c.code
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-border hover:bg-surface-muted'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {catalog.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <Select
                  label="Governorate"
                  value={form.governorateId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      governorateId: e.target.value,
                      cityId: '',
                    }))
                  }
                >
                  <option value="">Select governorate</option>
                  {(catalog.data?.governorates ?? []).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameEn}
                    </option>
                  ))}
                </Select>

                <Select
                  label="City"
                  value={form.cityId}
                  onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value }))}
                  required
                >
                  <option value="">Select city</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </Select>
              </>
            )}

            {!form.categoryId && !catalog.isLoading ? (
              <p className="text-sm text-error">
                Category catalog not loaded — check API connection.
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          isPlate ? (
            <div className="space-y-4">
              <Input
                label="Title (optional — auto from plate)"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={plateTitle(plate)}
              />
              <PlateEditor value={plate} onChange={setPlate} showExport />
              <TextArea
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <p className="text-xs text-ink-secondary">Minimum 10 characters</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Year"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                  required
                />
                <Input
                  label="Mileage (km)"
                  type="number"
                  value={form.mileageKm}
                  onChange={(e) => setForm((f) => ({ ...f, mileageKm: e.target.value }))}
                />
              </div>
              <Select
                label="Brand"
                value={form.brandId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brandId: e.target.value, modelId: '' }))
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
                value={form.modelId}
                onChange={(e) => setForm((f) => ({ ...f, modelId: e.target.value }))}
                disabled={!form.brandId}
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
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <p className="text-xs text-ink-secondary">Minimum 10 characters</p>
            </div>
          )
        ) : null}

        {step === 2 ? (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Photos</h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Upload vehicle images. Star the primary photo before continuing.
              </p>
              <MediaUploader
                className="mt-4"
                mediaType="IMAGE"
                ownerModule="listings"
                onAssetsChange={setImageAssetIds}
              />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Videos</h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Optional walk-around or engine video.
              </p>
              <MediaUploader
                className="mt-4"
                mediaType="VIDEO"
                ownerModule="listings"
                onAssetsChange={setVideoAssetIds}
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <CurrencySelect
              value={form.currencyCode}
              onChange={(currencyCode) => setForm((f) => ({ ...f, currencyCode }))}
            />
            <Input
              label={`Price (${form.currencyCode || 'IQD'})`}
              type="number"
              min={0}
              step={form.currencyCode === 'USD' ? '0.01' : '1'}
              value={form.primaryPrice}
              onChange={(e) => setForm((f) => ({ ...f, primaryPrice: e.target.value }))}
              required
            />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-6">
            {isPlate ? (
              <div className="max-w-md">
                <LicensePlate {...plate} size="fill" showExport={false} />
              </div>
            ) : null}

            <div className="space-y-2 text-sm">
              <p className="font-display text-xl font-semibold text-ink">{displayTitle}</p>
              <p className="text-ink-secondary">
                {categoryLabel} · {cityLabel}
                {brandLabel ? ` · ${brandLabel}` : ''}
                {modelLabel ? ` ${modelLabel}` : ''}
              </p>
              {isVehicle ? (
                <p className="text-ink-secondary">
                  {form.year}
                  {form.mileageKm ? ` · ${Number(form.mileageKm).toLocaleString()} km` : ''}
                </p>
              ) : null}
              <p className="text-lg font-semibold text-brand">
                {form.primaryPrice
                  ? formatMoney(Number(form.primaryPrice), form.currencyCode || 'IQD', 'en')
                  : '—'}
              </p>
              <p className="whitespace-pre-wrap text-ink-secondary">{form.description}</p>
            </div>

            {previewAssetIds.length ? (
              <div>
                <p className="mb-2 text-sm font-medium text-ink-secondary">Media</p>
                <div className="flex flex-wrap gap-2">
                  {previewAssets.map((q, index) => {
                    const asset = q.data;
                    const thumb =
                      asset?.urls?.thumbnail ??
                      mediaPublicUrl(asset?.variants?.find((v) => v.kind === 'THUMBNAIL')?.r2Key) ??
                      mediaPublicUrl(asset?.originalKey);
                    const isVideo = previewAssetIds[index] &&
                      videoAssetIds.includes(previewAssetIds[index]!);
                    return (
                      <div
                        key={previewAssetIds[index] ?? index}
                        className="relative h-20 w-20 overflow-hidden rounded-md border border-border bg-surface-muted"
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-ink-secondary">
                            {q.isLoading ? '…' : isVideo ? 'Video' : 'Photo'}
                          </div>
                        )}
                        {isVideo ? (
                          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
                            VIDEO
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-secondary">No media uploaded.</p>
            )}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4 text-sm text-ink-secondary">
            <p>
              Ready to publish <strong className="text-ink">{displayTitle}</strong> in{' '}
              {cityLabel}?
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-ink">Submit for review</strong> — creates a draft listing,
                attaches media, then sets status to PENDING.
              </li>
              <li>
                <strong className="text-ink">Save draft</strong> — creates a DRAFT listing only;
                finish and submit later from My Listings.
              </li>
            </ul>
            {authMode === 'mock' ? (
              <p className="rounded-md bg-brand-soft p-3 text-brand">
                Auth mode is mock ({config.authMode}). Use real API auth to publish.
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="flex flex-wrap justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0 || busy}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              disabled={!canNext || busy}
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busy || authMode === 'mock'}
                onClick={() => void publish(false)}
              >
                Save draft
              </Button>
              <Button
                type="button"
                disabled={busy || authMode === 'mock'}
                onClick={() => void publish(true)}
              >
                Submit for review
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
