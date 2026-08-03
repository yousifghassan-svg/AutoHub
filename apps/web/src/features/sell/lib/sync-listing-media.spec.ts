import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { syncListingMedia } from './sync-listing-media';

describe('syncListingMedia (P5-9)', () => {
  it('attaches pending, removes detached, and reorders cover-first', async () => {
    const calls: string[] = [];
    const meta = await syncListingMedia(
      {
        addMedia: async (input) => {
          calls.push(`add:${input.mediaAssetId}`);
          return { id: `lm-${input.mediaAssetId}` };
        },
        reorderMedia: async (input) => {
          calls.push(`reorder:${input.orderedIds.join(',')}`);
          return [];
        },
        removeMedia: async (input) => {
          calls.push(`remove:${input.mediaId}`);
          return { success: true as const };
        },
      },
      'listing-1',
      { imageAssetIds: ['a', 'c'], videoAssetIds: [] },
      {
        syncedMediaAssetIds: ['a', 'b'],
        listingMediaByAssetId: {
          a: 'lm-a',
          b: 'lm-b',
        },
      },
    );

    assert.ok(calls.includes('add:c'));
    assert.ok(calls.includes('remove:lm-b'));
    assert.ok(calls.includes('reorder:lm-a,lm-c'));
    assert.deepEqual(meta.listingMediaByAssetId, {
      a: 'lm-a',
      c: 'lm-c',
    });
    assert.ok(meta.syncedMediaAssetIds?.includes('c'));
  });

  it('no-ops when nothing changed', async () => {
    let addCount = 0;
    let removeCount = 0;
    await syncListingMedia(
      {
        addMedia: async () => {
          addCount += 1;
          return { id: 'x' };
        },
        reorderMedia: async () => [],
        removeMedia: async () => {
          removeCount += 1;
          return { success: true as const };
        },
      },
      'listing-1',
      { imageAssetIds: ['a'], videoAssetIds: [] },
      {
        syncedMediaAssetIds: ['a'],
        listingMediaByAssetId: { a: 'lm-a' },
      },
    );
    assert.equal(addCount, 0);
    assert.equal(removeCount, 0);
  });
});
