import type { ListingDraftEnvelope } from './types';

/**
 * Future-ready revision conflict check (multi-device / server sync).
 * Returns true when a remote revision is strictly ahead of local.
 * No remote sync in Release 0.5 — host may call this when sync lands.
 */
export function detectListingDraftRevisionConflict(input: {
  localRevision: number;
  remoteRevision: number;
}): boolean {
  return input.remoteRevision > input.localRevision;
}

/**
 * Compare two envelopes by revision + updatedAt (deterministic tie-break).
 * Positive → a newer; negative → b newer; 0 → equivalent.
 */
export function compareListingDraftFreshness(
  a: Pick<ListingDraftEnvelope, 'revision' | 'updatedAt'>,
  b: Pick<ListingDraftEnvelope, 'revision' | 'updatedAt'>,
): number {
  if (a.revision !== b.revision) return a.revision - b.revision;
  return a.updatedAt.localeCompare(b.updatedAt);
}
