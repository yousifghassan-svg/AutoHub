'use client';

import { CATEGORIES } from '@/features/listings/domain/types';
import { LicensePlate } from '../../components/LicensePlate';
import type { PlateFormState } from '../../components/PlateEditor';
import type { SellStepProps } from '@/features/sell/core/types';
import { asPlateDomainData } from '../domain-data';

function plateTitle(plate: PlateFormState): string {
  return `${plate.governorate} plate ${plate.code} ${plate.letter} ${plate.number}`;
}

/** Domain summary for review — media/price/location live in PublishStep shell. */
export function PlatePreview({ state }: SellStepProps) {
  const { plate } = asPlateDomainData(state.domainData);

  const categoryLabel =
    CATEGORIES.find((c) => c.code === state.categoryCode)?.label ??
    state.categoryCode;

  const displayTitle = state.title.trim() || plateTitle(plate);

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <LicensePlate {...plate} size="fill" showExport={false} />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
          {categoryLabel}
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-ink">
          {displayTitle}
        </p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-surface px-3 py-2 text-sm">
            <dt className="text-xs text-ink-secondary">Code</dt>
            <dd className="font-medium text-ink">{plate.code || '—'}</dd>
          </div>
          <div className="rounded-lg bg-surface px-3 py-2 text-sm">
            <dt className="text-xs text-ink-secondary">Letter</dt>
            <dd className="font-medium text-ink">{plate.letter || '—'}</dd>
          </div>
          <div className="rounded-lg bg-surface px-3 py-2 text-sm">
            <dt className="text-xs text-ink-secondary">Number</dt>
            <dd className="font-medium text-ink">{plate.number || '—'}</dd>
          </div>
        </dl>
      </div>

      {state.description.trim() ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
            Description
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-secondary">
            {state.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
