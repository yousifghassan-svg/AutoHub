'use client';

import {
  listingQualityGradeLabel,
  type ListingQualityItem,
  type ListingQualityResult,
  type ListingQualitySeverity,
} from '@autohub/utils';
import { cn } from '@/components/ui';

type Props = {
  quality: ListingQualityResult;
  className?: string;
  /** Compact mode for confirm strip */
  compact?: boolean;
};

const SECTION_COPY: Record<
  ListingQualitySeverity,
  { title: string; hint: string }
> = {
  required: {
    title: 'Must have',
    hint: 'Finish these before sending for review.',
  },
  recommended: {
    title: 'Nice to have',
    hint: 'These help your listing stand out.',
  },
  premium: {
    title: 'Stand out',
    hint: 'Optional extras buyers love.',
  },
};

function ItemRow({ item }: { item: ListingQualityItem }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        className={cn(
          'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
          item.ok ? 'bg-brand/15 text-brand' : 'bg-surface-muted text-ink-secondary',
        )}
        aria-hidden
      >
        {item.ok ? '✓' : '·'}
      </span>
      <div className="min-w-0">
        <p className={item.ok ? 'text-ink' : 'text-ink-secondary'}>{item.label}</p>
        {!item.ok ? (
          <p className="text-xs text-ink-secondary">{item.recommendation}</p>
        ) : null}
      </div>
    </li>
  );
}

function SeveritySection({
  severity,
  items,
}: {
  severity: ListingQualitySeverity;
  items: ListingQualityItem[];
}) {
  if (!items.length) return null;
  const copy = SECTION_COPY[severity];
  const open = items.filter((i) => !i.ok).length;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-ink">{copy.title}</p>
        <p className="text-xs text-ink-secondary">
          {open === 0 ? 'All set' : `${open} left`}
        </p>
      </div>
      <p className="text-xs text-ink-secondary">{copy.hint}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

export function ListingQualityPanel({ quality, className, compact }: Props) {
  const required = quality.items.filter((i) => i.severity === 'required');
  const recommended = quality.items.filter((i) => i.severity === 'recommended');
  const premium = quality.items.filter((i) => i.severity === 'premium');

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border bg-gradient-to-br from-brand-soft/40 to-surface-muted/40 px-4 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
            Listing score
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {quality.score}
            <span className="text-base font-normal text-ink-secondary">/100</span>
          </p>
          <p className="text-sm text-ink-secondary">
            {listingQualityGradeLabel(quality.grade)}
          </p>
        </div>
        <div className="min-w-[10rem] flex-1 space-y-2">
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Overall</span>
            <span>{quality.completionPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${quality.completionPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Must have</span>
            <span>{quality.requiredCompletionPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className={cn(
                'h-full transition-all duration-500',
                quality.canPublish ? 'bg-brand' : 'bg-amber-500',
              )}
              style={{ width: `${quality.requiredCompletionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {!compact && quality.recommendations.length ? (
        <div className="rounded-xl border border-border/80 px-4 py-3">
          <p className="text-sm font-medium text-ink">Suggested next steps</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-secondary">
            {quality.recommendations.slice(0, 4).map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!compact ? (
        <div className="space-y-6">
          <SeveritySection severity="required" items={required} />
          <SeveritySection severity="recommended" items={recommended} />
          <SeveritySection severity="premium" items={premium} />
        </div>
      ) : null}

      {!quality.canPublish ? (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-ink">
          A few must-have items are still open. You can save for later, or finish
          them to send for review.
        </p>
      ) : null}
    </div>
  );
}
