'use client';

import { Button } from '@/components/ui';

export function ListingPreviewBanner({ onExit }: { onExit: () => void }) {
  return (
    <div
      role="status"
      className="sticky top-0 z-40 border-b border-brand/30 bg-brand-soft px-4 py-3"
    >
      <div className="page-container flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">
          <span className="font-semibold text-brand">Preview mode</span>
          {' — '}
          You are seeing this listing exactly as a visitor would. Owner actions are hidden.
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={onExit}>
          Exit Preview
        </Button>
      </div>
    </div>
  );
}
