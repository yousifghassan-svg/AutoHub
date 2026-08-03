'use client';

import {
  listingQualityGradeLabel,
  type ListingQualityResult,
} from '@autohub/utils';
import { cn } from '@/components/ui';

type Props = {
  quality: ListingQualityResult;
  className?: string;
};

function SeverityBadge({
  severity,
}: {
  severity: 'required' | 'recommended' | 'premium';
}) {
  const label =
    severity === 'required'
      ? 'Required'
      : severity === 'recommended'
        ? 'Recommended'
        : 'Premium';
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        severity === 'required' && 'bg-error/10 text-error',
        severity === 'recommended' && 'bg-brand-soft text-brand',
        severity === 'premium' && 'bg-surface-muted text-ink-secondary',
      )}
    >
      {label}
    </span>
  );
}

export function ListingQualityPanel({ quality, className }: Props) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          Listing quality
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Improve visibility with a complete listing. Required items block
          review submit; recommended and premium tips are optional.
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-border bg-surface-muted/40 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
            Quality score
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {quality.score}
            <span className="text-base font-normal text-ink-secondary">
              /100
            </span>
          </p>
          <p className="text-sm text-ink-secondary">
            {listingQualityGradeLabel(quality.grade)}
          </p>
        </div>
        <div className="min-w-[10rem] flex-1 space-y-2">
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Completion</span>
            <span>{quality.completionPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-brand transition-all"
              style={{ width: `${quality.completionPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Required</span>
            <span>{quality.requiredCompletionPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className={cn(
                'h-full transition-all',
                quality.canPublish ? 'bg-brand' : 'bg-error',
              )}
              style={{ width: `${quality.requiredCompletionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {quality.recommendations.length ? (
        <div>
          <p className="text-sm font-medium text-ink">Recommendations</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-secondary">
            {quality.recommendations.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-ink-secondary">
          Great work — no open recommendations.
        </p>
      )}

      <div>
        <p className="text-sm font-medium text-ink">Checklist</p>
        <ul className="mt-2 space-y-2">
          {quality.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className={cn(item.ok ? 'text-ink' : 'text-ink-secondary')}>
                  <span className="mr-2" aria-hidden>
                    {item.ok ? '✓' : '○'}
                  </span>
                  {item.label}
                </p>
                {!item.ok ? (
                  <p className="ml-6 text-xs text-ink-secondary">
                    {item.recommendation}
                  </p>
                ) : null}
              </div>
              <SeverityBadge severity={item.severity} />
            </li>
          ))}
        </ul>
      </div>

      {!quality.canPublish ? (
        <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
          Complete all required items before submitting for review. You can
          still save a draft.
        </p>
      ) : null}
    </div>
  );
}
