/**
 * Listing Draft Engine — platform types.
 * Knows only generic listing drafts. Domain plugins own schema inside `domainData`.
 */

export const LISTING_DRAFT_SCHEMA_VERSION = 2 as const;

export type ListingDraftSyncStatus =
  | 'local'
  | 'server_draft'
  | 'consumed';

/** Marketplace-common fields shared by every listing type. */
export type ListingDraftCommon = {
  categoryCode: string;
  categoryId: string;
  governorateId: string;
  cityId: string;
  locationLat: string;
  locationLng: string;
  title: string;
  description: string;
  primaryPrice: string;
  currencyCode: string;
  negotiable: boolean;
  imageAssetIds: string[];
  videoAssetIds: string[];
};

/**
 * Opaque AI / sync metadata. Engine never interprets domain keys.
 * Reserved keys used by host adapters (still listing-generic):
 * - syncedMediaAssetIds: string[]
 */
export type ListingDraftMeta = {
  syncedMediaAssetIds?: string[];
  [key: string]: unknown;
};

/** Canonical persisted envelope (schemaVersion 2). */
export type ListingDraftEnvelope = {
  schemaVersion: typeof LISTING_DRAFT_SCHEMA_VERSION;
  localId: string;
  /** Server Listing id when synced as DRAFT (null = local-only). */
  listingId: string | null;
  domainId: string;
  workflowId: string;
  stepId: string;
  /** Monotonic local revision for future conflict detection. */
  revision: number;
  createdAt: string;
  updatedAt: string;
  syncStatus: ListingDraftSyncStatus;
  meta: ListingDraftMeta;
  common: ListingDraftCommon;
  /** Opaque — plugins serialize/hydrate only. */
  domainData: unknown;
};

/** Pre–dynamic-wizard web draft (remap only). */
export type LegacyListingDraftV1 = {
  version: 1;
  step: number;
  form: {
    categoryCode?: string;
    categoryId?: string;
    governorateId?: string;
    cityId?: string;
    title?: string;
    description?: string;
    primaryPrice?: string;
    currencyCode?: string;
    year?: string;
    mileageKm?: string;
    brandId?: string;
    modelId?: string;
  };
  plate?: Record<string, unknown>;
  imageAssetIds?: string[];
  videoAssetIds?: string[];
};

/**
 * Web sell draft v2 before listingId/revision envelope fields.
 * Still accepted and upgraded on load.
 */
export type LegacySellDraftV2Flat = {
  version: 2;
  domainId: string;
  workflowId: string;
  stepId: string;
  common: ListingDraftCommon;
  domainData: unknown;
  localId?: string;
  listingId?: string | null;
  revision?: number;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: ListingDraftSyncStatus;
  meta?: ListingDraftMeta;
};

export const DEFAULT_LISTING_DRAFT_COMMON: ListingDraftCommon = {
  categoryCode: 'CAR',
  categoryId: '',
  governorateId: '',
  cityId: '',
  locationLat: '',
  locationLng: '',
  title: '',
  description: '',
  primaryPrice: '',
  currencyCode: 'IQD',
  negotiable: false,
  imageAssetIds: [],
  videoAssetIds: [],
};
