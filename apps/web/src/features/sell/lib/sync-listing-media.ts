import {
  pendingMediaAssetIds,
  withSyncedMediaAssetIds,
  type ListingDraftMeta,
} from '@autohub/utils';
import type { SellCommonState } from '../core/types';
import {
  listingMediaMapFromMeta,
  withListingMediaMap,
  type ListingMediaAssetMap,
} from './hydrate-from-listing';

export type SyncListingMediaDeps = {
  addMedia: (input: {
    listingId: string;
    mediaAssetId: string;
    mediaType: string;
    sortOrder?: number;
  }) => Promise<{ id: string }>;
  reorderMedia: (input: {
    listingId: string;
    orderedIds: string[];
  }) => Promise<unknown>;
  removeMedia: (input: {
    listingId: string;
    mediaId: string;
  }) => Promise<unknown>;
};

/**
 * Attach new assets, remove detached listing media, reorder so index 0 is cover.
 * Listing-generic — used by create and edit hosts.
 */
export async function syncListingMedia(
  deps: SyncListingMediaDeps,
  listingId: string,
  common: Pick<SellCommonState, 'imageAssetIds' | 'videoAssetIds'>,
  meta: ListingDraftMeta,
): Promise<ListingDraftMeta> {
  let map = listingMediaMapFromMeta(meta);
  let nextMeta = meta;

  const pending = pendingMediaAssetIds(common, nextMeta);
  const imageSet = new Set(common.imageAssetIds);

  for (let i = 0; i < pending.length; i++) {
    const mediaAssetId = pending[i];
    if (!mediaAssetId) continue;
    const attached = await deps.addMedia({
      listingId,
      mediaAssetId,
      mediaType: imageSet.has(mediaAssetId) ? 'IMAGE' : 'VIDEO',
      sortOrder: i,
    });
    map = { ...map, [mediaAssetId]: attached.id };
    nextMeta = withSyncedMediaAssetIds(nextMeta, [mediaAssetId]);
  }

  nextMeta = withListingMediaMap(nextMeta, map);

  const desiredAssetIds = [
    ...common.imageAssetIds,
    ...common.videoAssetIds,
  ].filter(Boolean);
  const desiredSet = new Set(desiredAssetIds);

  for (const [assetId, listingMediaId] of Object.entries(map)) {
    if (!desiredSet.has(assetId)) {
      await deps.removeMedia({ listingId, mediaId: listingMediaId });
      delete map[assetId];
    }
  }

  nextMeta = withListingMediaMap(nextMeta, map);

  const orderedIds = desiredAssetIds
    .map((assetId) => map[assetId])
    .filter((id): id is string => Boolean(id));

  if (orderedIds.length > 0) {
    await deps.reorderMedia({ listingId, orderedIds });
  }

  return withSyncedMediaAssetIds(
    nextMeta,
    desiredAssetIds,
  );
}

export function mergeListingMediaMaps(
  base: ListingMediaAssetMap,
  patch: ListingMediaAssetMap,
): ListingMediaAssetMap {
  return { ...base, ...patch };
}
