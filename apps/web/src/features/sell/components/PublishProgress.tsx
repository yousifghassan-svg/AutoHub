'use client';

import { cn } from '@/components/ui';
import {
  publishReviewWorkSteps,
  publishWorkStepIndex,
  type PublishWorkStepId,
} from '../lib/publish-flow';

type Props = {
  current: PublishWorkStepId;
  className?: string;
};

export function PublishProgress({ current, className }: Props) {
  const steps = publishReviewWorkSteps();
  const activeIndex = publishWorkStepIndex(steps, current);

  return (
    <div className={cn('space-y-6 py-6 text-center', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">
          Almost there
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          We’re getting your listing ready. This only takes a moment.
        </p>
      </div>
      <ol className="mx-auto max-w-sm space-y-3 text-left">
        {steps.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
                active && 'bg-brand-soft text-brand',
                done && 'text-ink',
                !done && !active && 'text-ink-secondary',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  done && 'bg-brand text-white',
                  active && 'bg-brand text-white',
                  !done && !active && 'bg-surface-muted text-ink-secondary',
                )}
              >
                {done ? '✓' : index + 1}
              </span>
              {step.label}
              {active ? (
                <span className="ml-auto text-xs opacity-80">Working…</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
