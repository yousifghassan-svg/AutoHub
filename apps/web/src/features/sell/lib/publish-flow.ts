/**
 * Review & publish UX helpers — listing-generic, no domain knowledge.
 * Friendly copy only; no API/DB concerns.
 */

export type PublishUiPhase =
  | 'review'
  | 'confirm'
  | 'working'
  | 'success'
  | 'draft_saved';

export type PublishWorkStepId = 'saving' | 'photos' | 'sending';

export type PublishWorkStep = {
  id: PublishWorkStepId;
  label: string;
};

/** Ordered steps shown while sending a listing for review. */
export function publishReviewWorkSteps(): PublishWorkStep[] {
  return [
    { id: 'saving', label: 'Saving your listing' },
    { id: 'photos', label: 'Adding your photos' },
    { id: 'sending', label: 'Sending for review' },
  ];
}

/** Soften API/technical errors for sellers. */
export function friendlyPublishError(raw: string | null | undefined): string {
  const message = (raw ?? '').trim();
  if (!message) {
    return 'Something went wrong. Please try again in a moment.';
  }
  const lower = message.toLowerCase();
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Connection issue. Check your internet and try again.';
  }
  if (lower.includes('401') || lower.includes('unauthorized')) {
    return 'Please sign in again, then try sending your listing.';
  }
  if (lower.includes('403') || lower.includes('forbidden')) {
    return 'You don’t have permission to publish this listing.';
  }
  if (lower.includes('ready') && lower.includes('media')) {
    return 'One of your photos is still processing. Wait a moment, then try again.';
  }
  // Strip bare status codes / JSON noise when possible.
  if (/^\d{3}\b/.test(message) || message.startsWith('{')) {
    return 'We couldn’t finish publishing. Please try again.';
  }
  return message;
}

export function publishWorkStepIndex(
  steps: PublishWorkStep[],
  current: PublishWorkStepId,
): number {
  const idx = steps.findIndex((s) => s.id === current);
  return idx < 0 ? 0 : idx;
}
