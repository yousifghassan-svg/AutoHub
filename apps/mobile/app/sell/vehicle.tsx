import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Input, Loading, Text, useTheme } from '@autohub/mobile-ui';
import { CreateWizardChrome } from '@/src/features/create/components/CreateWizardChrome';
import { MediaStep } from '@/src/features/create/components/MediaStep';
import { OptionPicker } from '@/src/features/create/components/OptionPicker';
import { vehicleCreateRepo } from '@/src/features/create/di';
import {
  createEmptyVehicleDraft,
  VEHICLE_STEP_LABELS,
  VEHICLE_STEPS,
  vehicleProgress,
  type VehicleDraft,
  type VehicleWizardStep,
} from '@/src/features/create/domain/vehicle-draft';
import { validateVehicleStep } from '@/src/features/create/domain/validation';
import { useCatalogFilters } from '@/src/features/catalog/hooks/useCatalog';
import { pushListingNotification } from '@/src/features/notifications/listing-notifications.store';

export default function VehicleWizardScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ localId?: string }>();
  const catalog = useCatalogFilters();
  const [draft, setDraft] = useState<VehicleDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const repo = vehicleCreateRepo();
      if (params.localId) {
        const existing = await repo.getDraft(params.localId);
        if (!cancelled) setDraft(existing ?? createEmptyVehicleDraft());
      } else {
        const empty = createEmptyVehicleDraft();
        await repo.saveDraftLocal(empty);
        if (!cancelled) setDraft(empty);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.localId]);

  useEffect(() => {
    if (!draft) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void vehicleCreateRepo().saveDraftLocal(draft);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draft]);

  const patch = useCallback((partial: Partial<VehicleDraft>) => {
    setDraft((d) => (d ? { ...d, ...partial, updatedAt: new Date().toISOString() } : d));
  }, []);

  const vehicleCategories = useMemo(
    () =>
      (catalog.data?.categories ?? []).filter((c) => c.code !== 'PLATE').map((c) => ({
        id: c.id,
        label: c.nameEn,
        subtitle: c.nameAr,
      })),
    [catalog.data?.categories],
  );

  const brands = useMemo(
    () =>
      (catalog.data?.brands ?? []).map((b) => ({
        id: b.id,
        label: b.nameEn,
        subtitle: b.nameAr,
      })),
    [catalog.data?.brands],
  );

  const models = useMemo(
    () =>
      (catalog.data?.models ?? [])
        .filter((m) => !draft?.brandId || m.brandId === draft.brandId)
        .map((m) => ({ id: m.id, label: m.nameEn, subtitle: m.nameAr })),
    [catalog.data?.models, draft?.brandId],
  );

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).map((c) => ({
        id: c.id,
        label: c.nameEn,
        subtitle: c.nameAr,
      })),
    [catalog.data?.cities],
  );

  const go = (dir: 1 | -1) => {
    if (!draft) return;
    if (dir === 1) {
      const err = validateVehicleStep(draft);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    const idx = VEHICLE_STEPS.indexOf(draft.step);
    const next = VEHICLE_STEPS[idx + dir];
    if (next) patch({ step: next });
  };

  const publish = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const repo = vehicleCreateRepo();
      let next = await repo.syncDraftRemote(draft);
      setDraft(next);
      for (const item of next.media) {
        if (item.uploadStatus === 'attached') continue;
        setDraft((d) =>
          d
            ? {
                ...d,
                media: d.media.map((m) =>
                  m.localId === item.localId
                    ? { ...m, uploadStatus: 'uploading', progress: 0.05 }
                    : m,
                ),
              }
            : d,
        );
        try {
          next = await repo.uploadAndAttachMedia(next, item, (p) => {
            setDraft((d) =>
              d
                ? {
                    ...d,
                    media: d.media.map((m) =>
                      m.localId === item.localId
                        ? { ...m, uploadStatus: 'uploading', progress: p }
                        : m,
                    ),
                  }
                : d,
            );
          });
          setDraft(next);
        } catch (uploadErr) {
          setDraft((d) =>
            d
              ? {
                  ...d,
                  media: d.media.map((m) =>
                    m.localId === item.localId
                      ? {
                          ...m,
                          uploadStatus: 'failed',
                          error:
                            uploadErr instanceof Error ? uploadErr.message : 'Upload failed',
                        }
                      : m,
                  ),
                }
              : d,
          );
          throw uploadErr;
        }
      }
      // Media already attached above — publish only transitions status.
      next = await repo.publish({
        ...next,
        media: next.media.map((m) => ({ ...m, uploadStatus: 'attached' as const, progress: 1 })),
      });
      pushListingNotification({
        listingId: next.listingId!,
        domain: 'VEHICLE',
        title: next.title || 'Vehicle listing',
        status: 'PENDING',
        message: 'Your vehicle was submitted for review.',
      });
      await repo.removeDraft(next.localId);
      router.replace('/my-vehicles' as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setBusy(false);
    }
  };

  if (!draft || catalog.isLoading) {
    return <Loading label="Loading wizard…" />;
  }

  const step = draft.step as VehicleWizardStep;

  return (
    <CreateWizardChrome
      title={VEHICLE_STEP_LABELS[step]}
      subtitle={`${vehicleProgress(step)}% · Draft autosaved`}
      progress={vehicleProgress(step)}
      onClose={() => router.back()}
      onBack={step === 'category' ? undefined : () => go(-1)}
      showBack={step !== 'category'}
      onNext={() => {
        if (step === 'preview') void publish();
        else go(1);
      }}
      nextLabel={step === 'preview' ? 'Publish' : 'Continue'}
      nextLoading={busy}
      error={error}
    >
      {step === 'category' ? (
        <OptionPicker
          options={vehicleCategories}
          selectedId={draft.categoryId}
          onSelect={(item) => {
            const cat = catalog.data?.categories.find((c) => c.id === item.id);
            patch({
              categoryId: item.id,
              categoryCode: cat?.code ?? null,
              categoryLabel: item.label,
            });
          }}
        />
      ) : null}

      {step === 'brand' ? (
        <OptionPicker
          options={brands}
          selectedId={draft.brandId}
          onSelect={(item) =>
            patch({ brandId: item.id, brandLabel: item.label, modelId: null, modelLabel: '' })
          }
        />
      ) : null}

      {step === 'model' ? (
        <OptionPicker
          options={models}
          selectedId={draft.modelId}
          onSelect={(item) => patch({ modelId: item.id, modelLabel: item.label })}
        />
      ) : null}

      {step === 'year' ? (
        <Input
          label="Year"
          keyboardType="number-pad"
          value={draft.year}
          onChangeText={(year) => patch({ year })}
        />
      ) : null}

      {step === 'specs' ? (
        <ScrollView contentContainerStyle={{ gap: theme.spacing.md }}>
          <Text variant="label">Fuel</Text>
          <OptionPicker
            options={(catalog.data?.fuelTypes ?? []).map((x) => ({
              id: x.id,
              label: x.nameEn,
            }))}
            selectedId={draft.fuelTypeId}
            onSelect={(item) => patch({ fuelTypeId: item.id })}
          />
          <Text variant="label">Transmission</Text>
          <OptionPicker
            options={(catalog.data?.transmissionTypes ?? []).map((x) => ({
              id: x.id,
              label: x.nameEn,
            }))}
            selectedId={draft.transmissionTypeId}
            onSelect={(item) => patch({ transmissionTypeId: item.id })}
          />
          <Text variant="label">Body type</Text>
          <OptionPicker
            options={(catalog.data?.bodyTypes ?? []).map((x) => ({
              id: x.id,
              label: x.nameEn,
            }))}
            selectedId={draft.bodyTypeId}
            onSelect={(item) => patch({ bodyTypeId: item.id })}
          />
          <Input
            label="Mileage (km)"
            keyboardType="number-pad"
            value={draft.mileageKm}
            onChangeText={(mileageKm) => patch({ mileageKm })}
          />
          <Input
            label="Engine size (cc)"
            keyboardType="number-pad"
            value={draft.engineSizeCc}
            onChangeText={(engineSizeCc) => patch({ engineSizeCc })}
          />
          <Text variant="label">Colour</Text>
          <OptionPicker
            options={(catalog.data?.colors ?? []).map((x) => ({
              id: x.id,
              label: x.nameEn,
            }))}
            selectedId={draft.colorId}
            onSelect={(item) => patch({ colorId: item.id })}
          />
          <Text variant="label">Drive type</Text>
          <OptionPicker
            options={(catalog.data?.driveTypes ?? []).map((x) => ({
              id: x.id,
              label: x.nameEn,
            }))}
            selectedId={draft.driveTypeId}
            onSelect={(item) => patch({ driveTypeId: item.id })}
          />
          <Text variant="label">Condition</Text>
          <OptionPicker
            options={(catalog.data?.conditionTypes ?? []).map((x) => ({
              id: x.id,
              label: x.nameEn,
            }))}
            selectedId={draft.conditionTypeId}
            onSelect={(item) => patch({ conditionTypeId: item.id })}
          />
          <Input label="VIN (optional)" value={draft.vin} onChangeText={(vin) => patch({ vin })} />
        </ScrollView>
      ) : null}

      {step === 'price' ? (
        <View style={{ gap: theme.spacing.md }}>
          <Input
            label="Price"
            keyboardType="number-pad"
            value={draft.primaryPrice}
            onChangeText={(primaryPrice) => patch({ primaryPrice })}
          />
          <OptionPicker
            options={[
              { id: 'IQD', label: 'IQD' },
              { id: 'USD', label: 'USD' },
            ]}
            selectedId={draft.currencyCode}
            onSelect={(item) => patch({ currencyCode: item.id as 'IQD' | 'USD' })}
          />
          <View
            style={{
              flexDirection: theme.isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text variant="label">Negotiable</Text>
            <Switch
              value={draft.negotiable}
              onValueChange={(negotiable) => patch({ negotiable })}
            />
          </View>
        </View>
      ) : null}

      {step === 'description' ? (
        <ScrollView contentContainerStyle={{ gap: theme.spacing.md }}>
          <Input label="Title" value={draft.title} onChangeText={(title) => patch({ title })} />
          <Input
            label="Description"
            value={draft.description}
            onChangeText={(description) => patch({ description })}
            multiline
          />
          <Text variant="label">City</Text>
          <OptionPicker
            options={cities}
            selectedId={draft.cityId}
            onSelect={(item) => patch({ cityId: item.id, cityLabel: item.label })}
          />
        </ScrollView>
      ) : null}

      {step === 'photos' ? (
        <MediaStep media={draft.media} onChange={(media) => patch({ media })} />
      ) : null}

      {step === 'preview' ? (
        <ScrollView contentContainerStyle={{ gap: theme.spacing.sm }}>
          <Text variant="h3">
            {draft.title || `${draft.brandLabel} ${draft.modelLabel} ${draft.year}`}
          </Text>
          <Text variant="body">
            {draft.primaryPrice} {draft.currencyCode}
            {draft.negotiable ? ' · Negotiable' : ''}
          </Text>
          <Text variant="body" color="secondary">
            {draft.categoryLabel} · {draft.cityLabel} · {draft.mileageKm || '—'} km
          </Text>
          <Text variant="body" color="secondary">
            {draft.media.length} photo(s)
          </Text>
          <Text variant="caption" color="secondary">
            Publishing submits for review (PENDING).
          </Text>
        </ScrollView>
      ) : null}
    </CreateWizardChrome>
  );
}
