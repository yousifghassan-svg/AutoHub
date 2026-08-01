'use client';

import { MediaUploader } from '@/features/media';
import type { SellStepProps } from '../../core/types';

export function MediaStep({ state, patchCommon }: SellStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Photos</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Upload listing images. Star the primary photo before continuing.
        </p>
        <MediaUploader
          className="mt-4"
          mediaType="IMAGE"
          ownerModule="listings"
          onAssetsChange={(imageAssetIds) => patchCommon({ imageAssetIds })}
        />
        {state.imageAssetIds.length ? (
          <p className="mt-2 text-xs text-ink-secondary">
            {state.imageAssetIds.length} photo(s) selected
          </p>
        ) : null}
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Videos</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Optional walk-around or showcase video.
        </p>
        <MediaUploader
          className="mt-4"
          mediaType="VIDEO"
          ownerModule="listings"
          onAssetsChange={(videoAssetIds) => patchCommon({ videoAssetIds })}
        />
        {state.videoAssetIds.length ? (
          <p className="mt-2 text-xs text-ink-secondary">
            {state.videoAssetIds.length} video(s) selected
          </p>
        ) : null}
      </div>
    </div>
  );
}
