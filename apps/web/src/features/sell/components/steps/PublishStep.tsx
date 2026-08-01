'use client';

import type { ComponentType } from 'react';
import { config } from '@/lib/config';
import type { SellStepProps } from '../../core/types';

type PublishStepProps = SellStepProps & {
  Preview: ComponentType<SellStepProps>;
  displayTitle: string;
  cityLabel: string;
  authMode: string;
};

export function PublishStep({
  Preview,
  displayTitle,
  cityLabel,
  authMode,
  ...stepProps
}: PublishStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Preview</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Review your listing before publishing.
        </p>
        <div className="mt-4">
          <Preview {...stepProps} />
        </div>
      </div>

      <div className="space-y-4 text-sm text-ink-secondary">
        <p>
          Ready to publish <strong className="text-ink">{displayTitle}</strong> in{' '}
          {cityLabel}?
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong className="text-ink">Submit for review</strong> — creates a draft
            listing, attaches media, then sets status to PENDING.
          </li>
          <li>
            <strong className="text-ink">Save draft</strong> — creates a DRAFT listing
            only; finish and submit later from My Listings.
          </li>
        </ul>
        {authMode === 'dev' ? (
          <p className="rounded-md bg-brand-soft p-3 text-brand">
            Auth mode is dev ({config.authMode}). Publishing uses Nest JWT via
            /v1/auth/dev-login (API required; unavailable in production).
          </p>
        ) : null}
      </div>
    </div>
  );
}
