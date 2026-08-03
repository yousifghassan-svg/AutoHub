'use client';

import type { ComponentType } from 'react';
import type { ListingQualityResult } from '@autohub/utils';
import type { SellStepProps } from '../../core/types';
import { ListingQualityPanel } from '../ListingQualityPanel';
import { ReviewMediaGallery } from '../ReviewMediaGallery';
import { ReviewSummaryCards } from '../ReviewSummaryCards';

type PublishStepProps = SellStepProps & {
  Preview: ComponentType<SellStepProps>;
  displayTitle: string;
  cityLabel: string;
  governorateLabel?: string;
  quality: ListingQualityResult;
};

/**
 * Final inspection before publish — listing-generic shell.
 * Domain summary comes from plugin Preview (vehicle / plate / future).
 */
export function PublishStep({
  Preview,
  displayTitle,
  cityLabel,
  governorateLabel,
  quality,
  ...stepProps
}: PublishStepProps) {
  const { state, mode } = stepProps;
  const isEdit = mode === 'edit';

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          Final check
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
          {isEdit ? 'Review your changes' : 'Review your listing'}
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {isEdit ? (
            <>
              Confirm updates for{' '}
              <span className="font-medium text-ink">{displayTitle}</span>{' '}
              before saving.
            </>
          ) : (
            <>
              Take a last look — this is how buyers will first meet{' '}
              <span className="font-medium text-ink">{displayTitle}</span>.
            </>
          )}
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-ink">Photos & video</h3>
        <ReviewMediaGallery
          imageAssetIds={state.imageAssetIds}
          videoAssetIds={state.videoAssetIds}
        />
      </section>

      <ReviewSummaryCards
        price={state.primaryPrice}
        currencyCode={state.currencyCode}
        negotiable={state.negotiable}
        cityLabel={cityLabel}
        governorateLabel={governorateLabel}
      />

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-ink">Listing details</h3>
        <div className="rounded-xl border border-border bg-surface-muted/20 p-4">
          <Preview {...stepProps} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-ink">Quality check</h3>
        <ListingQualityPanel quality={quality} />
      </section>
    </div>
  );
}
