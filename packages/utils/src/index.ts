/** Shared pure utilities (no domain/business rules). */

export {
  Money,
  CurrencyMismatchError,
  formatMoney,
  toBcp47Locale,
  type MoneyCurrencyCode,
  type MoneyLocale,
} from './money';

export {
  LISTING_DRAFT_SCHEMA_VERSION,
  DEFAULT_LISTING_DRAFT_COMMON,
  newListingDraftLocalId,
  detectListingDraftRevisionConflict,
  compareListingDraftFreshness,
  createListingDraftAutosave,
  isLegacyListingDraftV1,
  isLegacySellDraftV2Flat,
  isListingDraftEnvelope,
  commonFromLegacyForm,
  createListingDraftEnvelope,
  touchListingDraft,
  migrateLegacyListingDraftV1,
  migrateLegacySellDraftV2Flat,
  parseListingDraft,
  pendingMediaAssetIds,
  withSyncedMediaAssetIds,
  type ListingDraftCommon,
  type ListingDraftEnvelope,
  type ListingDraftMeta,
  type ListingDraftSyncStatus,
  type LegacyListingDraftV1,
  type LegacySellDraftV2Flat,
  type CreateListingDraftInput,
} from './listing-draft';

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${String(value)}`);
}

export function joinUrl(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
