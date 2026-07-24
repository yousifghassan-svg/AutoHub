import { ListingStatus } from '@autohub/database';
import {
  canTransitionStatus,
  requiresModerationApproval,
} from './listing-status';

describe('listing status transitions', () => {
  it('allows DRAFT → PENDING', () => {
    expect(canTransitionStatus(ListingStatus.DRAFT, ListingStatus.PENDING)).toBe(true);
  });

  it('allows PENDING → ACTIVE', () => {
    expect(canTransitionStatus(ListingStatus.PENDING, ListingStatus.ACTIVE)).toBe(true);
  });

  it('requires moderation for PENDING → ACTIVE', () => {
    expect(
      requiresModerationApproval(ListingStatus.PENDING, ListingStatus.ACTIVE),
    ).toBe(true);
  });

  it('rejects SOLD → ACTIVE', () => {
    expect(canTransitionStatus(ListingStatus.SOLD, ListingStatus.ACTIVE)).toBe(false);
  });

  it('allows ACTIVE → RESERVED → SOLD → ARCHIVED', () => {
    expect(canTransitionStatus(ListingStatus.ACTIVE, ListingStatus.RESERVED)).toBe(true);
    expect(canTransitionStatus(ListingStatus.RESERVED, ListingStatus.SOLD)).toBe(true);
    expect(canTransitionStatus(ListingStatus.SOLD, ListingStatus.ARCHIVED)).toBe(true);
  });

  it('allows PENDING → REJECTED and REJECTED → DRAFT', () => {
    expect(canTransitionStatus(ListingStatus.PENDING, ListingStatus.REJECTED)).toBe(true);
    expect(canTransitionStatus(ListingStatus.REJECTED, ListingStatus.DRAFT)).toBe(true);
    expect(
      requiresModerationApproval(ListingStatus.PENDING, ListingStatus.REJECTED),
    ).toBe(true);
  });
});
