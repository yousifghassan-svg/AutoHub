import { ListingStatus } from '@autohub/database';
import {
  canTransitionStatus,
  isListingContentEditable,
  listingContentEditBlockedMessage,
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

describe('listing content editability (SEC-002)', () => {
  it.each([
    ListingStatus.ACTIVE,
    ListingStatus.DRAFT,
    ListingStatus.REJECTED,
    ListingStatus.PENDING,
    ListingStatus.RESERVED,
  ])('allows content edit when status is %s', (status) => {
    expect(isListingContentEditable(status)).toBe(true);
    expect(listingContentEditBlockedMessage(status)).toBeNull();
  });

  it.each([ListingStatus.SOLD, ListingStatus.ARCHIVED])(
    'blocks content edit when status is %s',
    (status) => {
      expect(isListingContentEditable(status)).toBe(false);
      expect(listingContentEditBlockedMessage(status)).toBe(
        `Cannot edit listing in status ${status}`,
      );
    },
  );
});
