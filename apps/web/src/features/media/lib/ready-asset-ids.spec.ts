import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { orderedReadyAssetIds } from './ready-asset-ids';

describe('orderedReadyAssetIds (P5-4)', () => {
  it('returns only done assets with ids', () => {
    assert.deepEqual(
      orderedReadyAssetIds([
        { status: 'queued', asset: { id: 'a' } },
        { status: 'done', asset: { id: 'b' } },
        { status: 'done' },
      ]),
      ['b'],
    );
  });

  it('puts primary first even if not at index 0', () => {
    assert.deepEqual(
      orderedReadyAssetIds([
        { status: 'done', asset: { id: 'a' }, isPrimary: false },
        { status: 'done', asset: { id: 'b' }, isPrimary: true },
        { status: 'done', asset: { id: 'c' }, isPrimary: false },
      ]),
      ['b', 'a', 'c'],
    );
  });

  it('preserves array order when primary is already first', () => {
    assert.deepEqual(
      orderedReadyAssetIds([
        { status: 'done', asset: { id: 'cover' }, isPrimary: true },
        { status: 'done', asset: { id: 'two' } },
      ]),
      ['cover', 'two'],
    );
  });
});
