'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button, Skeleton } from '@/components/ui';
import { useDomainMutations } from '@/features/listings/hooks/useDomainMutations';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { createVehiclesRepository } from '@/features/vehicles/data/vehicles.repository';
import {
  buildPatchBody,
  buildSparseCreateBody,
  hydrateStateFromVehicle,
  parseCompletenessErrors,
} from '@/features/vehicles/sell/server-sync';
import { getHttpClient } from '@/lib/api/client';
import {
  clearDraftStorage,
  loadDraftFromStorage,
  saveDraftToStorage,
} from '../core/draft-store';
import type {
  SellCommonState,
  SellDomainPlugin,
  SellStepId,
  SellStepProps,
  SellWizardState,
} from '../core/types';
import { DEFAULT_COMMON_STATE } from '../core/types';
import {
  clampStepId,
  getWorkflow,
} from '../core/workflows';
import {
  resolvePluginFromList,
  useSellDomainPlugins,
} from '../register';
import { SHARED_SELL_STEPS } from './sharedSteps';
import { PublishStep } from './steps/PublishStep';

function resolveStepComponent(
  stepId: SellStepId,
  plugin: SellDomainPlugin,
): ComponentType<SellStepProps> | null {
  if (stepId === 'publish') return null;
  return plugin.steps[stepId] ?? SHARED_SELL_STEPS[stepId] ?? null;
}

export function SellWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeListingId = searchParams.get('listingId');
  const { status, authMode } = useAuth();
  const catalog = useCatalogFilters();
  const { addMedia, createVehicle, updateVehicle } = useDomainMutations();
  const plugins = useSellDomainPlugins();
  const fallbackPlugin = plugins[0]!;

  const [stepId, setStepId] = useState<SellStepId>('category');
  const [error, setError] = useState<string | null>(null);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<SellWizardState>(() => ({
    ...DEFAULT_COMMON_STATE,
    domainData: fallbackPlugin.createInitialDomainData(),
  }));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const softCreateInFlight = useRef(false);
  const prevCategoryRef = useRef(state.categoryCode);
  const attachingRef = useRef(false);

  const plugin = resolvePluginFromList(plugins, state.categoryCode);
  const workflow = getWorkflow(plugin.workflowId);
  const stepIndex = Math.max(
    0,
    workflow.steps.findIndex((s) => s.id === stepId),
  );
  const currentStep = workflow.steps[stepIndex] ?? workflow.steps[0]!;
  const pct = ((stepIndex + 1) / workflow.steps.length) * 100;

  const validator = plugin.validators[currentStep.id];
  const canNext = validator ? validator(state) : true;

  const patchCommon = useCallback((patch: Partial<SellCommonState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const patchDomain = useCallback((patch: Record<string, unknown>) => {
    setState((prev) => ({
      ...prev,
      domainData: { ...prev.domainData, ...patch },
    }));
  }, []);

  const stepProps: SellStepProps = useMemo(
    () => ({ state, patchCommon, patchDomain }),
    [patchCommon, patchDomain, state],
  );

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'needs_profile') router.replace('/profile-setup');
  }, [status, router]);

  useEffect(() => {
    if (draftRestored) return;
    if (status !== 'authenticated') return;

    let cancelled = false;
    (async () => {
      if (resumeListingId) {
        try {
          const listing = await createVehiclesRepository(
            getHttpClient(),
          ).getById(resumeListingId);
          if (cancelled) return;
          const hydrated = hydrateStateFromVehicle(listing, {
            ...DEFAULT_COMMON_STATE,
            domainData: fallbackPlugin.createInitialDomainData(),
          });
          setState(hydrated.state);
          setStepId(clampStepId(hydrated.stepId, getWorkflow(plugin.workflowId)));
          prevCategoryRef.current = hydrated.state.categoryCode;
          setDraftRestored(true);
          return;
        } catch {
          // fall through to local draft
        }
      }

      const local = loadDraftFromStorage(fallbackPlugin);
      if (local) {
        setState(local.state);
        setStepId(local.stepId);
        prevCategoryRef.current = local.state.categoryCode;
      } else {
        setState({
          ...DEFAULT_COMMON_STATE,
          domainData: fallbackPlugin.createInitialDomainData(),
        });
      }
      setDraftRestored(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    draftRestored,
    fallbackPlugin,
    plugin.workflowId,
    resumeListingId,
    status,
  ]);

  useEffect(() => {
    if (!draftRestored) return;
    if (prevCategoryRef.current === state.categoryCode) return;

    const prevPlugin = resolvePluginFromList(plugins, prevCategoryRef.current);
    const nextPlugin = resolvePluginFromList(plugins, state.categoryCode);
    prevCategoryRef.current = state.categoryCode;

    if (prevPlugin.id !== nextPlugin.id) {
      setState((prev) => ({
        ...prev,
        domainData: nextPlugin.createInitialDomainData(),
      }));
    } else if (nextPlugin.onCategoryChange) {
      setState((prev) => ({
        ...prev,
        domainData: nextPlugin.onCategoryChange!(
          prev.domainData,
          prev.categoryCode,
        ),
      }));
    }

    const nextWorkflow = getWorkflow(nextPlugin.workflowId);
    setStepId((id) => clampStepId(id, nextWorkflow));
  }, [draftRestored, plugins, state.categoryCode]);

  // Local cache
  useEffect(() => {
    if (!draftRestored) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDraftToStorage(plugin, stepId, state);
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draftRestored, plugin, state, stepId]);

  // Server autosave (vehicles only)
  useEffect(() => {
    if (!draftRestored) return;
    if (status !== 'authenticated') return;
    if (plugin.id !== 'VEHICLE') return;
    if (currentStep.id === 'publish') return;
    if (!state.categoryId || !state.cityId) return;

    if (serverTimer.current) clearTimeout(serverTimer.current);
    serverTimer.current = setTimeout(() => {
      void (async () => {
        try {
          if (!state.listingId) {
            if (softCreateInFlight.current) return;
            softCreateInFlight.current = true;
            const created = await createVehicle.mutateAsync(
              buildSparseCreateBody(state),
            );
            softCreateInFlight.current = false;
            setState((prev) =>
              prev.listingId ? prev : { ...prev, listingId: created.id },
            );
            setSyncNote('Draft saved to your account');
            return;
          }
          await updateVehicle.mutateAsync({
            id: state.listingId,
            body: buildPatchBody(state, stepId),
          });
          setSyncNote('Draft synced');
        } catch {
          softCreateInFlight.current = false;
          setSyncNote('Offline — changes kept locally');
        }
      })();
    }, 500);

    return () => {
      if (serverTimer.current) clearTimeout(serverTimer.current);
    };
  }, [
    createVehicle,
    currentStep.id,
    draftRestored,
    plugin.id,
    state,
    status,
    stepId,
    updateVehicle,
  ]);

  // Attach newly uploaded media while DRAFT exists
  useEffect(() => {
    if (!state.listingId) return;
    if (attachingRef.current) return;
    const pending = [
      ...state.imageAssetIds.map((mediaAssetId) => ({
        mediaAssetId,
        mediaType: 'IMAGE' as const,
      })),
      ...state.videoAssetIds.map((mediaAssetId) => ({
        mediaAssetId,
        mediaType: 'VIDEO' as const,
      })),
    ].filter((item) => !state.attachedMediaAssetIds.includes(item.mediaAssetId));

    if (!pending.length) return;

    attachingRef.current = true;
    void (async () => {
      const attached: string[] = [];
      try {
        for (let i = 0; i < pending.length; i++) {
          const item = pending[i];
          if (!item) continue;
          await addMedia.mutateAsync({
            listingId: state.listingId!,
            mediaAssetId: item.mediaAssetId,
            mediaType: item.mediaType,
            sortOrder: state.attachedMediaAssetIds.length + i,
          });
          attached.push(item.mediaAssetId);
        }
        if (attached.length) {
          setState((prev) => ({
            ...prev,
            attachedMediaAssetIds: [
              ...new Set([...prev.attachedMediaAssetIds, ...attached]),
            ],
          }));
        }
      } catch {
        setSyncNote('Media attach failed — will retry on publish');
      } finally {
        attachingRef.current = false;
      }
    })();
  }, [
    addMedia,
    state.attachedMediaAssetIds,
    state.imageAssetIds,
    state.listingId,
    state.videoAssetIds,
  ]);

  useEffect(() => {
    if (!catalog.data?.categories) return;
    const match = catalog.data.categories.find(
      (c) => c.code === state.categoryCode,
    );
    if (match && match.id !== state.categoryId) {
      patchCommon({ categoryId: match.id });
    }
  }, [
    catalog.data?.categories,
    patchCommon,
    state.categoryCode,
    state.categoryId,
  ]);

  const cityLabel = useMemo(() => {
    const city = catalog.data?.cities.find((c) => c.id === state.cityId);
    return city?.nameEn ?? state.cityId;
  }, [catalog.data?.cities, state.cityId]);

  const displayTitle = state.title.trim() || 'Untitled';

  const attachMedia = useCallback(
    async (listingId: string) => {
      const assets = [
        ...state.imageAssetIds.map((mediaAssetId) => ({
          mediaAssetId,
          mediaType: 'IMAGE' as const,
        })),
        ...state.videoAssetIds.map((mediaAssetId) => ({
          mediaAssetId,
          mediaType: 'VIDEO' as const,
        })),
      ].filter(
        (item) => !state.attachedMediaAssetIds.includes(item.mediaAssetId),
      );
      for (let i = 0; i < assets.length; i++) {
        const item = assets[i];
        if (!item) continue;
        await addMedia.mutateAsync({
          listingId,
          mediaAssetId: item.mediaAssetId,
          mediaType: item.mediaType,
          sortOrder: state.attachedMediaAssetIds.length + i,
        });
      }
    },
    [addMedia, state.attachedMediaAssetIds, state.imageAssetIds, state.videoAssetIds],
  );

  const publish = useCallback(
    async (submitForReview: boolean) => {
      setError(null);
      if (!plugin.canSubmit(state)) {
        setError('Complete required fields before publishing.');
        return;
      }

      setBusy(true);
      try {
        await plugin.submit({ state, submitForReview, attachMedia });
        clearDraftStorage();
        router.push('/my-listings');
      } catch (e) {
        const parsed = parseCompletenessErrors(e);
        setError(parsed.message);
        if (parsed.step) {
          const workflowSteps = getWorkflow(plugin.workflowId);
          if (workflowSteps.steps.some((s) => s.id === parsed.step)) {
            setStepId(parsed.step);
          }
        }
      } finally {
        setBusy(false);
      }
    },
    [attachMedia, plugin, router, state],
  );

  const StepComponent = resolveStepComponent(currentStep.id, plugin);

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
      <h1 className="section-title">
        {state.listingId ? 'Edit listing' : 'Create listing'}
      </h1>
      <p className="mt-2 text-ink-secondary">
        Multi-step wizard with server drafts. Progress syncs to your account as
        you go.
      </p>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full bg-brand transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <p className="font-medium text-ink-secondary">
          Step {stepIndex + 1} of {workflow.steps.length}: {currentStep.label}
        </p>
        <p className="text-xs text-ink-secondary">
          {syncNote ?? (state.listingId ? 'Draft synced' : 'Draft saving locally')}
        </p>
      </div>

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6 shadow-card">
        {currentStep.id === 'publish' ? (
          <PublishStep
            {...stepProps}
            Preview={plugin.Preview}
            displayTitle={displayTitle}
            cityLabel={cityLabel}
            authMode={authMode}
          />
        ) : StepComponent ? (
          <StepComponent {...stepProps} />
        ) : (
          <p className="text-sm text-error">
            Missing step component for &quot;{currentStep.id}&quot;.
          </p>
        )}

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="flex flex-wrap justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={stepIndex === 0 || busy}
            onClick={() => {
              const prev = workflow.steps[stepIndex - 1];
              if (prev) setStepId(prev.id);
            }}
          >
            Back
          </Button>

          {stepIndex < workflow.steps.length - 1 ? (
            <Button
              type="button"
              disabled={!canNext || busy}
              onClick={() => {
                const next = workflow.steps[stepIndex + 1];
                if (next) setStepId(next.id);
              }}
            >
              Next
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void publish(false)}
              >
                Save draft
              </Button>
              <Button
                type="button"
                disabled={busy}
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
