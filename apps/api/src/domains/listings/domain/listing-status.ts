import { ListingStatus } from '@autohub/database';

/**
 * Allowed listing lifecycle transitions.
 * PENDING → ACTIVE requires admin/moderator (enforced in application layer).
 */
export const LISTING_STATUS_TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  DRAFT: [ListingStatus.PENDING, ListingStatus.ARCHIVED],
  PENDING: [ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.ARCHIVED],
  ACTIVE: [ListingStatus.RESERVED, ListingStatus.SOLD, ListingStatus.ARCHIVED],
  RESERVED: [ListingStatus.ACTIVE, ListingStatus.SOLD, ListingStatus.ARCHIVED],
  SOLD: [ListingStatus.ARCHIVED],
  ARCHIVED: [],
};

export function canTransitionStatus(
  from: ListingStatus,
  to: ListingStatus,
): boolean {
  if (from === to) return true;
  return LISTING_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Transitions that require LISTINGS_MODERATE (or admin). */
export function requiresModerationApproval(
  from: ListingStatus,
  to: ListingStatus,
): boolean {
  return from === ListingStatus.PENDING && to === ListingStatus.ACTIVE;
}
