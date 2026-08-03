'use client';

import { MediaUploader } from '@/features/media';
import type { SellStepProps } from '../../core/types';

/**
 * Listing-generic media step. Reuses platform MediaUploader for every
 * listing type (vehicles, plates, heavy equipment, and future verticals).
 */
export function MediaStep({ state, patchCommon }: SellStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Images</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Upload listing images. Star the cover image (shown first in search and
          detail). Order is saved with your draft.
        </p>
        <MediaUploader
          className="mt-4"
          mediaType="IMAGE"
          ownerModule="listings"
          initialAssetIds={state.imageAssetIds}
          onAssetsChange={(imageAssetIds) => patchCommon({ imageAssetIds })}
        />
        {state.imageAssetIds.length ? (
          <p className="mt-2 text-xs text-ink-secondary">
            {state.imageAssetIds.length} image(s) ready · cover is first
          </p>
        ) : null}
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Videos</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Optional showcase video. Future-ready for all listing types.
        </p>
        <MediaUploader
          className="mt-4"
          mediaType="VIDEO"
          ownerModule="listings"
          initialAssetIds={state.videoAssetIds}
          onAssetsChange={(videoAssetIds) => patchCommon({ videoAssetIds })}
        />
        {state.videoAssetIds.length ? (
          <p className="mt-2 text-xs text-ink-secondary">
            {state.videoAssetIds.length} video(s) ready
          </p>
        ) : null}
      </div>
    </div>
  );
}
