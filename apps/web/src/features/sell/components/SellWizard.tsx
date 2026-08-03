'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { withSyncedMediaAssetIds, type ListingDraftEnvelope } from '@autohub/utils';
import { useAuth } from '@/features/auth/AuthProvider';
import { hrefWithNext } from '@/features/auth/domain/login-return';
import { Button, Skeleton } from '@/components/ui';
import { isPlateListing } from '@/features/listings/domain/marketplace-path';
import type { ListingDetailModel, ListingStatus } from '@/features/listings/domain/types';
import { useDomainMutations } from '@/features/listings/hooks/useDomainMutations';
import { createPlatesRepository } from '@/features/plates/data/plates.repository';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { createVehiclesRepository } from '@/features/vehicles/data/vehicles.repository';
import { getHttpClient } from '@/lib/api/client';
import {
  clearDraftStorage,
  clearEditDraftStorage,
  createFreshDraftSession,
  loadDraftFromStorage,
  loadEditDraftFromStorage,
  saveDraftToStorage,
  sellEditDraftKey,
  SELL_DRAFT_KEY,
  type DraftSession,
} from '../core/draft-store';
import { evaluateWizardListingQuality } from '../quality/adapt-wizard-state';
import type {
  SellCommonState,
  SellDomainPlugin,
  SellStepId,
  SellStepProps,
  SellWizardMode,
  SellWizardState,
} from '../core/types';
import { DEFAULT_COMMON_STATE } from '../core/types';
import { clampStepId, getWorkflowForMode } from '../core/workflows';
import { hydrateSellStateFromListing } from '../lib/hydrate-from-listing';
import {
  friendlyPublishError,
  type PublishUiPhase,
  type PublishWorkStepId,
} from '../lib/publish-flow';
import { syncListingMedia } from '../lib/sync-listing-media';
import {
  resolvePluginFromList,
  useSellDomainPlugins,
} from '../register';
import { PublishConfirm } from './PublishConfirm';
import { PublishProgress } from './PublishProgress';
import { PublishSuccess } from './PublishSuccess';
import { SHARED_SELL_STEPS } from './sharedSteps';
import { PublishStep } from './steps/PublishStep';

const BLOCKED_EDIT_STATUSES = new Set<ListingStatus>(['SOLD', 'ARCHIVED']);

function resolveStepComponent(
  stepId: SellStepId,
  plugin: SellDomainPlugin,
): ComponentType<SellStepProps> | null {
  if (stepId === 'publish') return null;
  return plugin.steps[stepId] ?? SHARED_SELL_STEPS[stepId] ?? null;
}

export type SellWizardProps = {
  mode?: SellWizardMode;
  /** Required when mode is edit. */
  listingId?: string;
};

export function SellWizard({
  mode = 'create',
  listingId: editListingId,
}: SellWizardProps = {}) {
  const router = useRouter();
  const { status, session } = useAuth();
  const catalog = useCatalogFilters();
  const { addMedia, reorderMedia, removeMedia } = useDomainMutations();
  const plugins = useSellDomainPlugins();
  const fallbackPlugin = plugins[0]!;
  const isEdit = mode === 'edit';
  const draftStorageKey = isEdit
    ? sellEditDraftKey(editListingId ?? '')
    : SELL_DRAFT_KEY;

  const [stepId, setStepId] = useState<SellStepId>('category');
  const [error, setError] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [publishPhase, setPublishPhase] = useState<PublishUiPhase>('review');
  const [workStep, setWorkStep] = useState<PublishWorkStepId>('saving');
  const [listingStatus, setListingStatus] = useState<ListingStatus | null>(
    null,
  );
  const [sessionState, setSession] = useState<DraftSession>(() =>
    createFreshDraftSession(),
  );
  const [state, setState] = useState<SellWizardState>(() => ({
    ...DEFAULT_COMMON_STATE,
    domainData: fallbackPlugin.createInitialDomainData(),
  }));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const envelopeRef = useRef<ListingDraftEnvelope | null>(null);
  const sessionRef = useRef(sessionState);
  sessionRef.current = sessionState;
  const prevCategoryRef = useRef(state.categoryCode);

  const plugin = resolvePluginFromList(plugins, state.categoryCode);
  const workflow = getWorkflowForMode(plugin.workflowId, mode);
  const stepIndex = Math.max(
    0,
    workflow.steps.findIndex((s) => s.id === stepId),
  );
  const currentStep = workflow.steps[stepIndex] ?? workflow.steps[0]!;
  const pct = ((stepIndex + 1) / workflow.steps.length) * 100;
  const onPublishStep = currentStep.id === 'publish';
  const allowsReviewSubmit =
    !isEdit || listingStatus === 'DRAFT' || listingStatus === 'REJECTED';

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
    () => ({ state, patchCommon, patchDomain, mode }),
    [mode, patchCommon, patchDomain, state],
  );

  const editReturnPath = editListingId
    ? `/my-listings/${editListingId}/edit`
    : '/my-listings';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(
        hrefWithNext('/login', isEdit ? editReturnPath : '/sell'),
      );
      return;
    }
    if (status === 'needs_profile') {
      router.replace(
        hrefWithNext('/profile-setup', isEdit ? editReturnPath : '/sell'),
      );
    }
  }, [status, router, isEdit, editReturnPath]);

  useEffect(() => {
    if (draftRestored) return;
    if (status !== 'authenticated' && status !== 'needs_profile') return;

    let cancelled = false;

    const bootCreate = () => {
      const hydrated = loadDraftFromStorage(fallbackPlugin);
      if (hydrated) {
        setState(hydrated.state);
        setStepId(hydrated.stepId);
        setSession(hydrated.session);
        prevCategoryRef.current = hydrated.state.categoryCode;
      } else {
        setState({
          ...DEFAULT_COMMON_STATE,
          domainData: fallbackPlugin.createInitialDomainData(),
        });
        setSession(createFreshDraftSession());
      }
      envelopeRef.current = null;
      setDraftRestored(true);
    };

    const bootEdit = async () => {
      if (!editListingId) {
        setBootError('Missing listing id.');
        setDraftRestored(true);
        return;
      }

      try {
        let listing: ListingDetailModel;
        try {
          listing = await createVehiclesRepository(getHttpClient()).getById(
            editListingId,
          );
        } catch {
          listing = await createPlatesRepository(getHttpClient()).getById(
            editListingId,
          );
        }

        if (cancelled) return;

        const ownerId = listing.sellerId;
        const userId = session?.user.id;
        if (ownerId && userId && ownerId !== userId) {
          setBootError('You can only edit your own listings.');
          setDraftRestored(true);
          return;
        }

        const statusValue = (listing.status ?? 'DRAFT') as ListingStatus;
        if (BLOCKED_EDIT_STATUSES.has(statusValue)) {
          setBootError('Sold or archived listings can’t be edited.');
          setDraftRestored(true);
          return;
        }

        setListingStatus(statusValue);

        const activePlugin = resolvePluginFromList(
          plugins,
          listing.categoryCode ||
            (isPlateListing(listing) ? 'PLATE' : 'CAR'),
        );
        const fromListing = hydrateSellStateFromListing(listing, activePlugin);
        const localDraft = loadEditDraftFromStorage(
          editListingId,
          activePlugin,
        );

        if (localDraft) {
          setState(localDraft.state);
          setStepId(clampStepId(localDraft.stepId, getWorkflowForMode(activePlugin.workflowId, 'edit')));
          setSession({
            ...localDraft.session,
            listingId: editListingId,
            meta: {
              ...fromListing.mediaMeta,
              ...localDraft.session.meta,
              syncedMediaAssetIds:
                localDraft.session.meta.syncedMediaAssetIds ??
                fromListing.mediaMeta.syncedMediaAssetIds,
              listingMediaByAssetId:
                localDraft.session.meta.listingMediaByAssetId ??
                fromListing.mediaMeta.listingMediaByAssetId,
            },
          });
          prevCategoryRef.current = localDraft.state.categoryCode;
        } else {
          setState(fromListing.state);
          const editWorkflow = getWorkflowForMode(activePlugin.workflowId, 'edit');
          setStepId(editWorkflow.steps[0]?.id ?? 'category');
          setSession({
            ...createFreshDraftSession(),
            listingId: editListingId,
            syncStatus: 'server_draft',
            meta: fromListing.mediaMeta,
          });
          prevCategoryRef.current = fromListing.state.categoryCode;
        }
        envelopeRef.current = null;
      } catch (e) {
        if (!cancelled) {
          setBootError(
            e instanceof Error ? e.message : 'Could not load this listing.',
          );
        }
      } finally {
        if (!cancelled) setDraftRestored(true);
      }
    };

    if (isEdit) {
      void bootEdit();
    } else {
      bootCreate();
    }

    return () => {
      cancelled = true;
    };
  }, [
    draftRestored,
    editListingId,
    fallbackPlugin,
    isEdit,
    plugins,
    session?.user.id,
    status,
  ]);

  useEffect(() => {
    if (!draftRestored || isEdit) return;
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

    const nextWorkflow = getWorkflowForMode(nextPlugin.workflowId, mode);
    setStepId((id) => clampStepId(id, nextWorkflow));
  }, [draftRestored, isEdit, mode, plugins, state.categoryCode]);

  useEffect(() => {
    if (!draftRestored || bootError) return;
    if (publishPhase === 'working' || publishPhase === 'success') return;
    if (isEdit && !editListingId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const saved = saveDraftToStorage(
        plugin,
        stepId,
        state,
        sessionRef.current,
        envelopeRef.current,
        draftStorageKey,
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
  }, [
    bootError,
    draftRestored,
    draftStorageKey,
    editListingId,
    isEdit,
    plugin,
    publishPhase,
    state,
    stepId,
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

  const attachAndSyncMedia = useCallback(
    async (listingId: string) => {
      const nextMeta = await syncListingMedia(
        {
          addMedia: (input) => addMedia.mutateAsync(input),
          reorderMedia: (input) => reorderMedia.mutateAsync(input),
          removeMedia: (input) => removeMedia.mutateAsync(input),
        },
        listingId,
        state,
        sessionRef.current.meta,
      );
      setSession((prev) => ({ ...prev, meta: nextMeta }));
    },
    [addMedia, removeMedia, reorderMedia, state],
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

      if (isEdit && !sessionState.listingId && !editListingId) {
        setError('Missing listing id for edit.');
        return;
      }

      setBusy(true);
      setPublishPhase('working');
      setWorkStep('saving');
      try {
        const result = await plugin.submit({
          state,
          listingId: sessionState.listingId ?? editListingId ?? null,
          submitForReview: submitForReview && allowsReviewSubmit,
          mode,
          attachMedia: async (listingId) => {
            setWorkStep('photos');
            await attachAndSyncMedia(listingId);
            if (submitForReview) setWorkStep('sending');
          },
        });

        if (submitForReview && allowsReviewSubmit) {
          setWorkStep('sending');
          if (isEdit) {
            clearEditDraftStorage(result.listingId);
          } else {
            clearDraftStorage();
          }
          envelopeRef.current = null;
          setPublishPhase('success');
          return;
        }

        // Live listing edit: PATCH + media sync, then clear edit draft.
        if (isEdit && !allowsReviewSubmit) {
          clearEditDraftStorage(result.listingId);
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
          draftStorageKey,
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
      allowsReviewSubmit,
      attachAndSyncMedia,
      draftStorageKey,
      editListingId,
      isEdit,
      mode,
      plugin,
      quality.missingRequired,
      sessionState.listingId,
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

  if (bootError) {
    return (
      <div className="page-container max-w-2xl space-y-4 py-10">
        <Link href="/my-listings" className="text-sm font-semibold text-brand">
          ← My listings
        </Link>
        <h1 className="section-title">Can’t edit listing</h1>
        <p className="text-sm text-ink-secondary">{bootError}</p>
        <Link href="/my-listings">
          <Button type="button">Back to my listings</Button>
        </Link>
      </div>
    );
  }

  const resolvedSuccessMode: 'review' | 'draft' | 'saved' =
    isEdit && !allowsReviewSubmit ? 'saved' : 'review';

  return (
    <div className="page-container max-w-2xl py-10">
      {showFlowChrome ? (
        <>
          {isEdit ? (
            <Link
              href="/my-listings"
              className="text-sm font-semibold text-brand"
            >
              ← My listings
            </Link>
          ) : null}
          <h1 className={`section-title ${isEdit ? 'mt-3' : ''}`}>
            {onPublishStep
              ? isEdit
                ? 'Review & save'
                : 'Review & publish'
              : isEdit
                ? 'Edit listing'
                : 'Create listing'}
          </h1>
          <p className="mt-2 text-ink-secondary">
            {onPublishStep
              ? isEdit
                ? 'Same checklist as create — confirm details, then save.'
                : 'A calm last look before your listing goes for review.'
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
            mode={resolvedSuccessMode}
            title={displayTitle}
            onPrimary={() => router.push('/my-listings')}
            onSecondary={
              isEdit ? () => setPublishPhase('review') : resetWizard
            }
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
              ) : allowsReviewSubmit ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void runPublish(false)}
                  >
                    {isEdit ? 'Save draft' : 'Save for later'}
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
              ) : (
                <Button
                  type="button"
                  disabled={busy || !quality.canPublish}
                  onClick={() => void runPublish(false)}
                >
                  Save changes
                </Button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
