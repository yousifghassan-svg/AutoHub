import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Input, Loading, Text, useTheme } from '@autohub/mobile-ui';
import { CreateWizardChrome } from '@/src/features/create/components/CreateWizardChrome';
import { MediaStep } from '@/src/features/create/components/MediaStep';
import { OptionPicker } from '@/src/features/create/components/OptionPicker';
import { plateCreateRepo } from '@/src/features/create/di';
import {
  createEmptyPlateDraft,
  PLATE_STEP_LABELS,
  PLATE_STEPS,
  plateProgress,
  type PlateDraft,
  type PlateWizardStep,
} from '@/src/features/create/domain/plate-draft';
import { validatePlateStep } from '@/src/features/create/domain/validation';
import {
  useCatalogFilters,
  usePlateCategories,
  usePlatePrefixes,
  usePlateProvinces,
} from '@/src/features/catalog/hooks/useCatalog';
import { pushListingNotification } from '@/src/features/notifications/listing-notifications.store';

export default function PlateWizardScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ localId?: string }>();
  const catalog = useCatalogFilters();
  const provinces = usePlateProvinces();
  const plateCategories = usePlateCategories();
  const [draft, setDraft] = useState<PlateDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefixes = usePlatePrefixes(draft?.formatCode ?? undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const repo = plateCreateRepo();
      if (params.localId) {
        const existing = await repo.getDraft(params.localId);
        if (!cancelled) setDraft(existing ?? createEmptyPlateDraft());
      } else {
        const empty = createEmptyPlateDraft();
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
      void plateCreateRepo().saveDraftLocal(draft);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draft]);

  const patch = useCallback((partial: Partial<PlateDraft>) => {
    setDraft((d) => (d ? { ...d, ...partial, updatedAt: new Date().toISOString() } : d));
  }, []);

  const listingCategoryId = useMemo(() => {
    const plateCat = catalog.data?.categories.find((c) => c.code === 'PLATE');
    return plateCat?.id ?? null;
  }, [catalog.data?.categories]);

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).map((c) => ({
        id: c.id,
        label: c.nameEn,
        subtitle: c.nameAr,
      })),
    [catalog.data?.cities],
  );

  const provinceOptions = useMemo(
    () =>
      (provinces.data ?? []).map((p) => ({
        id: p.id,
        label: p.nameEn,
        subtitle: p.nameAr ?? p.code,
      })),
    [provinces.data],
  );

  const go = (dir: 1 | -1) => {
    if (!draft) return;
    if (dir === 1) {
      const err = validatePlateStep(draft);
      if (err) {
        setError(err);
        return;
      }
    }
    setError(null);
    const idx = PLATE_STEPS.indexOf(draft.step);
    const next = PLATE_STEPS[idx + dir];
    if (next) patch({ step: next });
  };

  const publish = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const withCategory: PlateDraft = {
        ...draft,
        categoryId: draft.categoryId ?? listingCategoryId,
      };
      const repo = plateCreateRepo();
      let next = await repo.syncDraftRemote(withCategory);
      setDraft(next);
      for (const item of next.media) {
        if (item.uploadStatus === 'attached') continue;
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
      next = await repo.publish({
        ...next,
        media: next.media.map((m) => ({ ...m, uploadStatus: 'attached' as const, progress: 1 })),
      });
      pushListingNotification({
        listingId: next.listingId!,
        domain: 'PLATE',
        title: next.title || `${next.regionCode} ${next.series} ${next.number}`,
        status: 'PENDING',
        message: 'Your plate listing was submitted for review.',
      });
      await repo.removeDraft(next.localId);
      router.replace('/my-plates' as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setBusy(false);
    }
  };

  if (!draft || catalog.isLoading || provinces.isLoading) {
    return <Loading label="Loading plate wizard…" />;
  }

  const step = draft.step as PlateWizardStep;

  return (
    <CreateWizardChrome
      title={PLATE_STEP_LABELS[step]}
      subtitle={`${plateProgress(step)}% · Draft autosaved`}
      progress={plateProgress(step)}
      onClose={() => router.back()}
      onBack={step === 'province' ? undefined : () => go(-1)}
      showBack={step !== 'province'}
      onNext={() => {
        if (step === 'preview') void publish();
        else go(1);
      }}
      nextLabel={step === 'preview' ? 'Publish' : 'Continue'}
      nextLoading={busy}
      error={error}
    >
      {step === 'province' ? (
        <OptionPicker
          options={provinceOptions}
          selectedId={draft.provinceId}
          onSelect={(item) => {
            const province = provinces.data?.find((p) => p.id === item.id);
            const format = province?.plateFormats?.[0];
            patch({
              provinceId: item.id,
              provinceLabel: item.label,
              formatCode: format?.code ?? null,
              regionCode: format?.regionCode ?? province?.code ?? '',
              platePrefixId: null,
              series: '',
            });
          }}
        />
      ) : null}

      {step === 'category' ? (
        <OptionPicker
          options={(plateCategories.data ?? []).map((c) => ({
            id: c.id,
            label: c.nameEn,
            subtitle: c.nameAr ?? c.code,
          }))}
          selectedId={draft.plateCategoryId}
          onSelect={(item) =>
            patch({
              plateCategoryId: item.id,
              plateCategoryLabel: item.label,
              categoryId: listingCategoryId,
            })
          }
        />
      ) : null}

      {step === 'prefix' ? (
        <View style={{ flex: 1, gap: theme.spacing.md }}>
          <OptionPicker
            options={(prefixes.data ?? []).map((p) => ({
              id: p.id,
              label: p.letter,
              subtitle: p.label ?? p.formatCode,
            }))}
            selectedId={draft.platePrefixId}
            onSelect={(item) => patch({ platePrefixId: item.id, series: item.label })}
          />
          <Input
            label="Or type prefix / series"
            value={draft.series}
            onChangeText={(series) => patch({ series, platePrefixId: null })}
            autoCapitalize="characters"
          />
        </View>
      ) : null}

      {step === 'number' ? (
        <View style={{ gap: theme.spacing.md }}>
          <Input
            label="Number"
            keyboardType="number-pad"
            value={draft.number}
            onChangeText={(number) => patch({ number })}
          />
          <Text variant="label">Digits (optional guide)</Text>
          <OptionPicker
            options={[
              { id: 'any', label: 'Any' },
              { id: '3', label: '3 digits' },
              { id: '4', label: '4 digits' },
              { id: '5', label: '5 digits' },
            ]}
            selectedId={draft.digits || 'any'}
            onSelect={(item) => patch({ digits: item.id })}
          />
        </View>
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
          <Input
            label="Title (optional)"
            value={draft.title}
            onChangeText={(title) => patch({ title })}
            placeholder={`${draft.regionCode} ${draft.series} ${draft.number}`.trim()}
          />
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
        <MediaStep media={draft.media} onChange={(media) => patch({ media })} max={8} />
      ) : null}

      {step === 'preview' ? (
        <ScrollView contentContainerStyle={{ gap: theme.spacing.sm }}>
          <Text variant="h3">
            {draft.title || `${draft.regionCode} ${draft.series} ${draft.number}`.trim()}
          </Text>
          <Text variant="body">
            {draft.primaryPrice} {draft.currencyCode}
            {draft.negotiable ? ' · Negotiable' : ''}
          </Text>
          <Text variant="body" color="secondary">
            {draft.provinceLabel} · {draft.plateCategoryLabel} · {draft.cityLabel}
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
