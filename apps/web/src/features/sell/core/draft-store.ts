import {
  createListingDraftEnvelope,
  parseListingDraft,
  touchListingDraft,
  type ListingDraftEnvelope,
  type ListingDraftMeta,
  type ListingDraftSyncStatus,
  type LegacyListingDraftV1,
} from '@autohub/utils';
import {
  DEFAULT_COMMON_STATE,
  type LegacySellDraftV1,
  type SellCommonState,
  type SellDomainPlugin,
  type SellStepId,
  type SellWizardState,
} from './types';
import {
  clampStepId,
  getWorkflow,
  mapLegacyStepToWorkflowStepId,
} from './workflows';
import { resolveSellDomain } from './registry';

/** Storage key — unchanged for upgrade safety (create flow only). */
export const SELL_DRAFT_KEY = 'autohub.sell.draft';

/** Edit drafts are scoped per listing so they never collide with create. */
export function sellEditDraftKey(listingId: string): string {
  return `autohub.sell.edit.draft:${listingId}`;
}

export type DraftSession = {
  localId: string;
  listingId: string | null;
  revision: number;
  syncStatus: ListingDraftSyncStatus;
  meta: ListingDraftMeta;
};

export type HydratedSellDraft = {
  state: SellWizardState;
  stepId: SellStepId;
  domainId: string;
  workflowId: string;
  session: DraftSession;
};

function toCommon(common: SellCommonState): SellCommonState {
  return {
    ...DEFAULT_COMMON_STATE,
    ...common,
    imageAssetIds: common.imageAssetIds ?? [],
    videoAssetIds: common.videoAssetIds ?? [],
  };
}

function unwrapDomainPayload(domainData: unknown): {
  raw: unknown;
  legacy?: LegacySellDraftV1;
} {
  if (
    domainData &&
    typeof domainData === 'object' &&
    '__legacyV1' in domainData
  ) {
    return {
      raw: undefined,
      legacy: (domainData as { __legacyV1: LegacySellDraftV1 }).__legacyV1,
    };
  }
  return { raw: domainData };
}

function envelopeToHydrated(
  envelope: ListingDraftEnvelope,
  fallbackPlugin: SellDomainPlugin,
): HydratedSellDraft {
  const active =
    resolveSellDomain(envelope.common.categoryCode) ?? fallbackPlugin;
  const workflow = getWorkflow(active.workflowId);
  const { raw, legacy } = unwrapDomainPayload(envelope.domainData);
  return {
    domainId: active.id,
    workflowId: workflow.id,
    stepId: clampStepId(envelope.stepId, workflow),
    state: {
      ...toCommon(envelope.common as SellCommonState),
      domainData: active.mapDraftToDomain(raw, legacy),
    },
    session: {
      localId: envelope.localId,
      listingId: envelope.listingId,
      revision: envelope.revision,
      syncStatus: envelope.syncStatus,
      meta: envelope.meta ?? {},
    },
  };
}

/**
 * Host adapter over the platform Listing Draft Engine.
 * Domain resolution stays here; the engine never imports plugins.
 */
export function hydrateDraft(
  raw: unknown,
  fallbackPlugin: SellDomainPlugin,
): HydratedSellDraft | null {
  const envelope = parseListingDraft(raw, (legacy: LegacyListingDraftV1) => {
    const common = {
      ...DEFAULT_COMMON_STATE,
      categoryCode:
        legacy.form?.categoryCode ?? DEFAULT_COMMON_STATE.categoryCode,
    };
    const active = resolveSellDomain(common.categoryCode) ?? fallbackPlugin;
    const workflow = getWorkflow(active.workflowId);
    return {
      domainId: active.id,
      workflowId: workflow.id,
      stepId: mapLegacyStepToWorkflowStepId(legacy.step ?? 0, workflow),
    };
  });
  if (!envelope) return null;
  return envelopeToHydrated(envelope, fallbackPlugin);
}

export function serializeDraft(
  plugin: SellDomainPlugin,
  stepId: SellStepId,
  state: SellWizardState,
  session: DraftSession,
): ListingDraftEnvelope {
  const common: SellCommonState = {
    categoryCode: state.categoryCode,
    categoryId: state.categoryId,
    governorateId: state.governorateId,
    cityId: state.cityId,
    locationLat: state.locationLat,
    locationLng: state.locationLng,
    title: state.title,
    description: state.description,
    primaryPrice: state.primaryPrice,
    currencyCode: state.currencyCode,
    negotiable: state.negotiable,
    imageAssetIds: state.imageAssetIds,
    videoAssetIds: state.videoAssetIds,
  };

  const base = createListingDraftEnvelope({
    localId: session.localId,
    listingId: session.listingId,
    domainId: plugin.id,
    workflowId: plugin.workflowId,
    stepId,
    common,
    domainData: plugin.serializeDomainData(state.domainData),
    meta: session.meta,
    syncStatus: session.syncStatus,
  });

  // Preserve revision/createdAt from session by reconstructing via touch chain.
  return {
    ...base,
    revision: session.revision,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
}

/** Build next envelope for autosave (bumps revision). */
export function nextDraftEnvelope(
  previous: ListingDraftEnvelope | null,
  plugin: SellDomainPlugin,
  stepId: SellStepId,
  state: SellWizardState,
  session: DraftSession,
): ListingDraftEnvelope {
  const serialized = serializeDraft(plugin, stepId, state, session);
  const base =
    previous && previous.localId === session.localId
      ? previous
      : { ...serialized, revision: session.revision };
  return touchListingDraft(base, {
    stepId,
    domainId: plugin.id,
    workflowId: plugin.workflowId,
    listingId: session.listingId,
    syncStatus: session.syncStatus,
    meta: session.meta,
    common: serialized.common,
    domainData: serialized.domainData,
  });
}

export function loadDraftFromStorage(
  fallbackPlugin: SellDomainPlugin,
): HydratedSellDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SELL_DRAFT_KEY);
    if (!raw) return null;
    return hydrateDraft(JSON.parse(raw) as unknown, fallbackPlugin);
  } catch {
    return null;
  }
}

export function loadEditDraftFromStorage(
  listingId: string,
  fallbackPlugin: SellDomainPlugin,
): HydratedSellDraft | null {
  if (typeof window === 'undefined' || !listingId) return null;
  try {
    const raw = localStorage.getItem(sellEditDraftKey(listingId));
    if (!raw) return null;
    const hydrated = hydrateDraft(JSON.parse(raw) as unknown, fallbackPlugin);
    if (!hydrated) return null;
    // Refuse drafts that point at a different listing.
    if (hydrated.session.listingId && hydrated.session.listingId !== listingId) {
      return null;
    }
    return {
      ...hydrated,
      session: { ...hydrated.session, listingId },
    };
  } catch {
    return null;
  }
}

export function saveDraftEnvelopeToStorage(
  envelope: ListingDraftEnvelope,
  storageKey: string = SELL_DRAFT_KEY,
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey, JSON.stringify(envelope));
}

export function saveDraftToStorage(
  plugin: SellDomainPlugin,
  stepId: SellStepId,
  state: SellWizardState,
  session: DraftSession,
  previous: ListingDraftEnvelope | null = null,
  storageKey: string = SELL_DRAFT_KEY,
): ListingDraftEnvelope {
  const envelope = nextDraftEnvelope(previous, plugin, stepId, state, session);
  saveDraftEnvelopeToStorage(envelope, storageKey);
  return envelope;
}

export function clearDraftStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SELL_DRAFT_KEY);
}

export function clearEditDraftStorage(listingId: string): void {
  if (typeof window === 'undefined' || !listingId) return;
  localStorage.removeItem(sellEditDraftKey(listingId));
}

export function createFreshDraftSession(): DraftSession {
  const envelope = createListingDraftEnvelope({
    domainId: 'pending',
    workflowId: 'pending',
    stepId: 'category',
  });
  return {
    localId: envelope.localId,
    listingId: null,
    revision: envelope.revision,
    syncStatus: 'local',
    meta: {},
  };
}
