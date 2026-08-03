'use client';

import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { hrefWithNext } from '@/features/auth/domain/login-return';
import { Button, Skeleton } from '@/components/ui';
import { useDomainMutations } from '@/features/listings/hooks/useDomainMutations';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
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
  const { status, authMode } = useAuth();
  const catalog = useCatalogFilters();
  const { addMedia } = useDomainMutations();
  const plugins = useSellDomainPlugins();
  const fallbackPlugin = plugins[0]!;

  const [stepId, setStepId] = useState<SellStepId>('category');
  const [error, setError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<SellWizardState>(() => ({
    ...DEFAULT_COMMON_STATE,
    domainData: fallbackPlugin.createInitialDomainData(),
  }));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCategoryRef = useRef(state.categoryCode);

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
    if (status === 'unauthenticated') {
      router.replace(hrefWithNext('/login', '/sell'));
      return;
    }
    if (status === 'needs_profile') {
      router.replace(hrefWithNext('/profile-setup', '/sell'));
    }
  }, [status, router]);

  useEffect(() => {
    if (draftRestored) return;
    const hydrated = loadDraftFromStorage(fallbackPlugin);
    if (hydrated) {
      setState(hydrated.state);
      setStepId(hydrated.stepId);
      prevCategoryRef.current = hydrated.state.categoryCode;
    } else {
      setState({
        ...DEFAULT_COMMON_STATE,
        domainData: fallbackPlugin.createInitialDomainData(),
      });
    }
    setDraftRestored(true);
  }, [draftRestored, fallbackPlugin]);

  // When category switches domain, reset domain payload and clamp step.
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
    [addMedia, state.imageAssetIds, state.videoAssetIds],
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
        setError(e instanceof Error ? e.message : 'Publish failed');
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
      <h1 className="section-title">Create listing</h1>
      <p className="mt-2 text-ink-secondary">
        Multi-step wizard with autosaved draft. Progress is saved locally as you
        go.
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
        <p className="text-xs text-ink-secondary">Draft saved automatically</p>
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
                if (!canNext || busy) return;
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
