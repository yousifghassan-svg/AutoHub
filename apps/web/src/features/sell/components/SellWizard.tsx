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
import {
  pendingMediaAssetIds,
  withSyncedMediaAssetIds,
  type ListingDraftEnvelope,
} from '@autohub/utils';
import { useAuth } from '@/features/auth/AuthProvider';
import { hrefWithNext } from '@/features/auth/domain/login-return';
import { Button, Skeleton } from '@/components/ui';
import { useDomainMutations } from '@/features/listings/hooks/useDomainMutations';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import {
  clearDraftStorage,
  createFreshDraftSession,
  loadDraftFromStorage,
  saveDraftToStorage,
  type DraftSession,
} from '../core/draft-store';
import { evaluateWizardListingQuality } from '../quality/adapt-wizard-state';
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
  friendlyPublishError,
  type PublishUiPhase,
  type PublishWorkStepId,
} from '../lib/publish-flow';
import {
  resolvePluginFromList,
  useSellDomainPlugins,
} from '../register';
import { PublishConfirm } from './PublishConfirm';
import { PublishProgress } from './PublishProgress';
import { PublishSuccess } from './PublishSuccess';
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
  const { status } = useAuth();
  const catalog = useCatalogFilters();
  const { addMedia } = useDomainMutations();
  const plugins = useSellDomainPlugins();
  const fallbackPlugin = plugins[0]!;

  const [stepId, setStepId] = useState<SellStepId>('category');
  const [error, setError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [publishPhase, setPublishPhase] = useState<PublishUiPhase>('review');
  const [workStep, setWorkStep] = useState<PublishWorkStepId>('saving');
  const [session, setSession] = useState<DraftSession>(() =>
    createFreshDraftSession(),
  );
  const [state, setState] = useState<SellWizardState>(() => ({
    ...DEFAULT_COMMON_STATE,
    domainData: fallbackPlugin.createInitialDomainData(),
  }));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const envelopeRef = useRef<ListingDraftEnvelope | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const prevCategoryRef = useRef(state.categoryCode);

  const plugin = resolvePluginFromList(plugins, state.categoryCode);
  const workflow = getWorkflow(plugin.workflowId);
  const stepIndex = Math.max(
    0,
    workflow.steps.findIndex((s) => s.id === stepId),
  );
  const currentStep = workflow.steps[stepIndex] ?? workflow.steps[0]!;
  const pct = ((stepIndex + 1) / workflow.steps.length) * 100;
  const onPublishStep = currentStep.id === 'publish';

  const validator = plugin.validators[currentStep.id];
  const canNext = validator ? validator(state) : true;
  const quality = useMemo(
    () =>
      evaluateWizardListingQuality(state, plugin.getQualityRules(state)),
    [plugin, state],
  );

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
      setSession(hydrated.session);
      prevCategoryRef.current = hydrated.state.categoryCode;
      envelopeRef.current = null;
    } else {
      setState({
        ...DEFAULT_COMMON_STATE,
        domainData: fallbackPlugin.createInitialDomainData(),
      });
      setSession(createFreshDraftSession());
    }
    setDraftRestored(true);
  }, [draftRestored, fallbackPlugin]);

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
    if (publishPhase === 'working' || publishPhase === 'success') return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const saved = saveDraftToStorage(
        plugin,
        stepId,
        state,
        sessionRef.current,
        envelopeRef.current,
      );
      envelopeRef.current = saved;
      setSession((prev) =>
        prev.revision === saved.revision && prev.localId === saved.localId
          ? prev
          : { ...prev, revision: saved.revision, localId: saved.localId },
      );
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draftRestored, plugin, publishPhase, state, stepId]);

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

  // Reset publish UX when leaving the review step.
  useEffect(() => {
    if (!onPublishStep) {
      setPublishPhase('review');
      setError(null);
    }
  }, [onPublishStep]);

  const cityLabel = useMemo(() => {
    const city = catalog.data?.cities.find((c) => c.id === state.cityId);
    return city?.nameEn ?? (state.cityId ? 'Selected city' : 'Not set');
  }, [catalog.data?.cities, state.cityId]);

  const governorateLabel = useMemo(() => {
    const gov = catalog.data?.governorates?.find(
      (g) => g.id === state.governorateId,
    );
    return gov?.nameEn ?? '';
  }, [catalog.data?.governorates, state.governorateId]);

  const displayTitle = state.title.trim() || 'Untitled listing';

  const attachPendingMedia = useCallback(
    async (listingId: string) => {
      const pending = pendingMediaAssetIds(
        {
          imageAssetIds: state.imageAssetIds,
          videoAssetIds: state.videoAssetIds,
        },
        session.meta,
      );
      if (!pending.length) return;

      const imageSet = new Set(state.imageAssetIds);
      for (let i = 0; i < pending.length; i++) {
        const mediaAssetId = pending[i];
        if (!mediaAssetId) continue;
        await addMedia.mutateAsync({
          listingId,
          mediaAssetId,
          mediaType: imageSet.has(mediaAssetId) ? 'IMAGE' : 'VIDEO',
          sortOrder: i,
        });
      }

      setSession((prev) => ({
        ...prev,
        meta: withSyncedMediaAssetIds(prev.meta, pending),
      }));
    },
    [addMedia, session.meta, state.imageAssetIds, state.videoAssetIds],
  );

  const runPublish = useCallback(
    async (submitForReview: boolean) => {
      setError(null);
      if (submitForReview && !plugin.canSubmit(state)) {
        setPublishPhase('review');
        setError(
          quality.missingRequired[0]?.recommendation ??
            'Finish the must-have items before sending for review.',
        );
        return;
      }

      setBusy(true);
      setPublishPhase('working');
      setWorkStep('saving');
      try {
        const result = await plugin.submit({
          state,
          listingId: session.listingId,
          submitForReview,
          attachMedia: async (listingId) => {
            setWorkStep('photos');
            await attachPendingMedia(listingId);
            if (submitForReview) setWorkStep('sending');
          },
        });

        if (submitForReview) {
          setWorkStep('sending');
          clearDraftStorage();
          envelopeRef.current = null;
          setPublishPhase('success');
          return;
        }

        const nextSession: DraftSession = {
          ...sessionRef.current,
          listingId: result.listingId,
          syncStatus: 'server_draft',
          meta: withSyncedMediaAssetIds(sessionRef.current.meta, [
            ...state.imageAssetIds,
            ...state.videoAssetIds,
          ]),
        };
        setSession(nextSession);
        const saved = saveDraftToStorage(
          plugin,
          stepId,
          state,
          nextSession,
          envelopeRef.current,
        );
        envelopeRef.current = saved;
        setPublishPhase('draft_saved');
      } catch (e) {
        setPublishPhase('review');
        setError(
          friendlyPublishError(
            e instanceof Error ? e.message : 'Something went wrong',
          ),
        );
      } finally {
        setBusy(false);
      }
    },
    [
      attachPendingMedia,
      plugin,
      quality.missingRequired,
      session.listingId,
      state,
      stepId,
    ],
  );

  const resetWizard = useCallback(() => {
    clearDraftStorage();
    envelopeRef.current = null;
    setSession(createFreshDraftSession());
    setState({
      ...DEFAULT_COMMON_STATE,
      domainData: fallbackPlugin.createInitialDomainData(),
    });
    setStepId('category');
    setPublishPhase('review');
    setError(null);
  }, [fallbackPlugin]);

  const StepComponent = resolveStepComponent(currentStep.id, plugin);
  const showFlowChrome =
    publishPhase === 'review' || publishPhase === 'confirm';

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
      {showFlowChrome ? (
        <>
          <h1 className="section-title">
            {onPublishStep ? 'Review & publish' : 'Create listing'}
          </h1>
          <p className="mt-2 text-ink-secondary">
            {onPublishStep
              ? 'A calm last look before your listing goes for review.'
              : 'Your progress is saved automatically as you go.'}
          </p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <p className="font-medium text-ink-secondary">
              Step {stepIndex + 1} of {workflow.steps.length}:{' '}
              {onPublishStep ? 'Review' : currentStep.label}
            </p>
            <p className="text-xs text-ink-secondary">Saved automatically</p>
          </div>
        </>
      ) : null}

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6 shadow-card">
        {publishPhase === 'working' ? (
          <PublishProgress current={workStep} />
        ) : null}

        {publishPhase === 'success' ? (
          <PublishSuccess
            mode="review"
            title={displayTitle}
            onPrimary={() => router.push('/my-listings')}
            onSecondary={resetWizard}
          />
        ) : null}

        {publishPhase === 'draft_saved' ? (
          <PublishSuccess
            mode="draft"
            title={displayTitle}
            onPrimary={() => router.push('/my-listings')}
            onSecondary={() => setPublishPhase('review')}
          />
        ) : null}

        {publishPhase === 'confirm' ? (
          <PublishConfirm
            title={displayTitle}
            cityLabel={cityLabel}
            score={quality.score}
            busy={busy}
            onCancel={() => setPublishPhase('review')}
            onConfirm={() => void runPublish(true)}
          />
        ) : null}

        {publishPhase === 'review' ? (
          <>
            {onPublishStep ? (
              <PublishStep
                {...stepProps}
                Preview={plugin.Preview}
                displayTitle={displayTitle}
                cityLabel={cityLabel}
                governorateLabel={governorateLabel}
                quality={quality}
              />
            ) : StepComponent ? (
              <StepComponent {...stepProps} />
            ) : (
              <p className="text-sm text-ink-secondary">
                This step isn’t available right now. Go back and try another
                step.
              </p>
            )}

            {error ? (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-ink">
                {error}
              </p>
            ) : null}

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
                    onClick={() => void runPublish(false)}
                  >
                    Save for later
                  </Button>
                  <Button
                    type="button"
                    disabled={busy || !quality.canPublish}
                    onClick={() => {
                      setError(null);
                      setPublishPhase('confirm');
                    }}
                  >
                    Send for review
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
