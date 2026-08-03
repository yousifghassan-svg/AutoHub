'use client';

import { Button, cn } from '@/components/ui';

type Props = {
  mode: 'review' | 'draft' | 'saved';
  title: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  className?: string;
};

export function PublishSuccess({
  mode,
  title,
  onPrimary,
  onSecondary,
  className,
}: Props) {
  const isReview = mode === 'review';
  const isSaved = mode === 'saved';

  return (
    <div className={cn('space-y-6 py-8 text-center', className)}>
      <div className="publish-success-burst mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
        <span className="publish-success-check text-3xl text-brand" aria-hidden>
          ✓
        </span>
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold text-ink">
          {isReview
            ? 'Your listing is on its way'
            : isSaved
              ? 'Changes saved'
              : 'Draft saved'}
        </h2>
        <p className="mx-auto max-w-md text-sm text-ink-secondary">
          {isReview ? (
            <>
              <span className="font-medium text-ink">{title}</span> was sent for
              a quick check. You’ll be notified when it’s live for buyers.
            </>
          ) : isSaved ? (
            <>
              <span className="font-medium text-ink">{title}</span> is up to
              date. Buyers will see your latest details.
            </>
          ) : (
            <>
              <span className="font-medium text-ink">{title}</span> is saved.
              Come back anytime to finish and send it for review.
            </>
          )}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={onPrimary}>
          {isReview || isSaved ? 'View my listings' : 'Go to my listings'}
        </Button>
        {onSecondary ? (
          <Button type="button" variant="secondary" onClick={onSecondary}>
            {isReview ? 'Create another' : 'Keep editing'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
