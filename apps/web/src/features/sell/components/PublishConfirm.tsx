'use client';

import { Button, cn } from '@/components/ui';

type Props = {
  title: string;
  cityLabel: string;
  score: number;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  className?: string;
};

export function PublishConfirm({
  title,
  cityLabel,
  score,
  onCancel,
  onConfirm,
  busy,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'space-y-5 rounded-xl border border-border bg-surface-muted/40 px-5 py-6',
        className,
      )}
    >
      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold text-ink">
          Ready to send?
        </h2>
        <p className="text-sm text-ink-secondary">
          We’ll send{' '}
          <span className="font-medium text-ink">{title}</span> in{' '}
          <span className="font-medium text-ink">{cityLabel}</span> for a quick
          check before buyers can see it.
        </p>
        <p className="text-sm text-ink-secondary">
          Listing score right now:{' '}
          <span className="font-medium text-ink">{score}/100</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Not yet
        </Button>
        <Button type="button" disabled={busy} onClick={onConfirm}>
          Yes, send for review
        </Button>
      </div>
    </div>
  );
}
