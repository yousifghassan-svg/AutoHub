import { newListingDraftLocalId } from './ids';
import {
  DEFAULT_LISTING_DRAFT_COMMON,
  LISTING_DRAFT_SCHEMA_VERSION,
  type LegacyListingDraftV1,
  type LegacySellDraftV2Flat,
  type ListingDraftCommon,
  type ListingDraftEnvelope,
  type ListingDraftMeta,
  type ListingDraftSyncStatus,
} from './types';

function nowIso(): string {
  return new Date().toISOString();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export function isLegacyListingDraftV1(raw: unknown): raw is LegacyListingDraftV1 {
  return isObject(raw) && raw.version === 1;
}

export function isLegacySellDraftV2Flat(raw: unknown): raw is LegacySellDraftV2Flat {
  return isObject(raw) && raw.version === 2 && raw.schemaVersion == null;
}

export function isListingDraftEnvelope(raw: unknown): raw is ListingDraftEnvelope {
  return (
    isObject(raw) &&
    raw.schemaVersion === LISTING_DRAFT_SCHEMA_VERSION &&
    typeof raw.localId === 'string' &&
    typeof raw.stepId === 'string' &&
    isObject(raw.common)
  );
}

export function commonFromLegacyForm(
  form: LegacyListingDraftV1['form'] | undefined,
  imageAssetIds: string[],
  videoAssetIds: string[],
): ListingDraftCommon {
  return {
    ...DEFAULT_LISTING_DRAFT_COMMON,
    categoryCode: form?.categoryCode ?? DEFAULT_LISTING_DRAFT_COMMON.categoryCode,
    categoryId: form?.categoryId ?? '',
    governorateId: form?.governorateId ?? '',
    cityId: form?.cityId ?? '',
    title: form?.title ?? '',
    description: form?.description ?? '',
    primaryPrice: form?.primaryPrice ?? '',
    currencyCode: form?.currencyCode ?? 'IQD',
    negotiable: false,
    locationLat: '',
    locationLng: '',
    imageAssetIds,
    videoAssetIds,
  };
}

export type CreateListingDraftInput = {
  domainId: string;
  workflowId: string;
  stepId: string;
  common?: Partial<ListingDraftCommon>;
  domainData?: unknown;
  listingId?: string | null;
  meta?: ListingDraftMeta;
  syncStatus?: ListingDraftSyncStatus;
  localId?: string;
};

export function createListingDraftEnvelope(
  input: CreateListingDraftInput,
): ListingDraftEnvelope {
  const ts = nowIso();
  return {
    schemaVersion: LISTING_DRAFT_SCHEMA_VERSION,
    localId: input.localId ?? newListingDraftLocalId(),
    listingId: input.listingId ?? null,
    domainId: input.domainId,
    workflowId: input.workflowId,
    stepId: input.stepId,
    revision: 1,
    createdAt: ts,
    updatedAt: ts,
    syncStatus: input.syncStatus ?? 'local',
    meta: input.meta ?? {},
    common: { ...DEFAULT_LISTING_DRAFT_COMMON, ...input.common },
    domainData: input.domainData ?? null,
  };
}

/** Bump revision + updatedAt after a local edit (autosave). */
export function touchListingDraft(
  draft: ListingDraftEnvelope,
  patch: Partial<
    Pick<
      ListingDraftEnvelope,
      | 'stepId'
      | 'common'
      | 'domainData'
      | 'domainId'
      | 'workflowId'
      | 'listingId'
      | 'syncStatus'
      | 'meta'
    >
  >,
): ListingDraftEnvelope {
  return {
    ...draft,
    ...patch,
    meta: patch.meta ?? draft.meta,
    common: patch.common ?? draft.common,
    revision: draft.revision + 1,
    updatedAt: nowIso(),
  };
}

export function migrateLegacyListingDraftV1(
  draft: LegacyListingDraftV1,
  input: { domainId: string; workflowId: string; stepId: string },
): ListingDraftEnvelope {
  const common = commonFromLegacyForm(
    draft.form ?? {},
    draft.imageAssetIds ?? [],
    draft.videoAssetIds ?? [],
  );
  return createListingDraftEnvelope({
    domainId: input.domainId,
    workflowId: input.workflowId,
    stepId: input.stepId,
    common,
    /** Opaque legacy bag for plugin mapDraftToDomain — engine does not read it. */
    domainData: { __legacyV1: draft },
    meta: { migratedFrom: 1 },
  });
}

export function migrateLegacySellDraftV2Flat(
  draft: LegacySellDraftV2Flat,
): ListingDraftEnvelope {
  const ts = nowIso();
  return {
    schemaVersion: LISTING_DRAFT_SCHEMA_VERSION,
    localId: draft.localId ?? newListingDraftLocalId(),
    listingId: draft.listingId ?? null,
    domainId: draft.domainId,
    workflowId: draft.workflowId,
    stepId: draft.stepId,
    revision: draft.revision ?? 1,
    createdAt: draft.createdAt ?? ts,
    updatedAt: draft.updatedAt ?? ts,
    syncStatus: draft.syncStatus ?? (draft.listingId ? 'server_draft' : 'local'),
    meta: draft.meta ?? {},
    common: { ...DEFAULT_LISTING_DRAFT_COMMON, ...draft.common },
    domainData: draft.domainData,
  };
}

/**
 * Parse any known persisted draft shape into a ListingDraftEnvelope.
 * Returns null when unrecognized. Does not resolve domains or clamp steps.
 */
export function parseListingDraft(
  raw: unknown,
  resolveLegacyV1Steps: (draft: LegacyListingDraftV1) => {
    domainId: string;
    workflowId: string;
    stepId: string;
  } | null,
): ListingDraftEnvelope | null {
  if (isListingDraftEnvelope(raw)) {
    return {
      ...raw,
      common: { ...DEFAULT_LISTING_DRAFT_COMMON, ...raw.common },
      meta: raw.meta ?? {},
      listingId: raw.listingId ?? null,
    };
  }
  if (isLegacySellDraftV2Flat(raw)) {
    return migrateLegacySellDraftV2Flat(raw);
  }
  if (isLegacyListingDraftV1(raw)) {
    const resolved = resolveLegacyV1Steps(raw);
    if (!resolved) return null;
    return migrateLegacyListingDraftV1(raw, resolved);
  }
  return null;
}

/** Media asset ids that still need server attach (listing-generic). */
export function pendingMediaAssetIds(
  common: Pick<ListingDraftCommon, 'imageAssetIds' | 'videoAssetIds'>,
  meta: ListingDraftMeta,
): string[] {
  const synced = new Set(meta.syncedMediaAssetIds ?? []);
  return [...common.imageAssetIds, ...common.videoAssetIds].filter(
    (id) => id && !synced.has(id),
  );
}

export function withSyncedMediaAssetIds(
  meta: ListingDraftMeta,
  attachedIds: string[],
): ListingDraftMeta {
  const merged = new Set([...(meta.syncedMediaAssetIds ?? []), ...attachedIds]);
  return { ...meta, syncedMediaAssetIds: [...merged] };
}
