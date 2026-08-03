'use client';

import { formatMoney } from '@/features/currencies/lib/format-money';
import { cn } from '@/components/ui';

type Props = {
  price: string;
  currencyCode: string;
  negotiable?: boolean;
  cityLabel: string;
  governorateLabel?: string;
  className?: string;
};

export function ReviewSummaryCards({
  price,
  currencyCode,
  negotiable,
  cityLabel,
  governorateLabel,
  className,
}: Props) {
  const priceLabel = price
    ? formatMoney(Number(price), currencyCode || 'IQD', 'en')
    : 'Not set';

  const locationLabel = [cityLabel, governorateLabel]
    .filter((x) => Boolean(x && x !== '—'))
    .join(', ');

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <div className="rounded-xl border border-border bg-surface-muted/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
          Price
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-brand">
          {priceLabel}
        </p>
        {negotiable ? (
          <p className="mt-0.5 text-xs text-ink-secondary">Open to offers</p>
        ) : null}
      </div>
      <div className="rounded-xl border border-border bg-surface-muted/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
          Location
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-ink">
          {locationLabel || 'Not set'}
        </p>
      </div>
    </div>
  );
}
