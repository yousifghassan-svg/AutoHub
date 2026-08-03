import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compareListingDraftFreshness,
  createListingDraftEnvelope,
  detectListingDraftRevisionConflict,
  pendingMediaAssetIds,
  parseListingDraft,
  touchListingDraft,
  withSyncedMediaAssetIds,
} from './index';

describe('listing draft engine (P5-5)', () => {
  it('creates envelope with revision 1 and local sync', () => {
    const draft = createListingDraftEnvelope({
      domainId: 'vehicles',
      workflowId: 'vehicle',
      stepId: 'category',
      common: { title: 'Test' },
    });
    assert.equal(draft.schemaVersion, 2);
    assert.equal(draft.revision, 1);
    assert.equal(draft.syncStatus, 'local');
    assert.equal(draft.listingId, null);
    assert.equal(draft.common.title, 'Test');
    assert.ok(draft.localId.startsWith('ld_'));
  });

  it('bumps revision on touch', () => {
    const draft = createListingDraftEnvelope({
      domainId: 'vehicles',
      workflowId: 'vehicle',
      stepId: 'category',
    });
    const next = touchListingDraft(draft, { stepId: 'media' });
    assert.equal(next.revision, 2);
    assert.equal(next.stepId, 'media');
    assert.ok(typeof next.updatedAt === 'string' && next.updatedAt.length > 0);
  });

  it('migrates flat sell v2 and legacy v1', () => {
    const fromV2 = parseListingDraft(
      {
        version: 2,
        domainId: 'vehicles',
        workflowId: 'vehicle',
        stepId: 'media',
        common: { title: 'A', categoryCode: 'CAR' },
        domainData: { year: '2020' },
      },
      () => null,
    );
    assert.ok(fromV2);
    assert.equal(fromV2!.schemaVersion, 2);
    assert.equal(fromV2!.stepId, 'media');
    assert.equal((fromV2!.domainData as { year: string }).year, '2020');

    const fromV1 = parseListingDraft(
      {
        version: 1,
        step: 2,
        form: { categoryCode: 'CAR', title: 'Legacy' },
        imageAssetIds: ['img1'],
      },
      () => ({
        domainId: 'vehicles',
        workflowId: 'vehicle',
        stepId: 'vehicleDetails',
      }),
    );
    assert.ok(fromV1);
    assert.equal(fromV1!.common.title, 'Legacy');
    assert.deepEqual(fromV1!.common.imageAssetIds, ['img1']);
    assert.equal(
      (fromV1!.domainData as { __legacyV1: { version: number } }).__legacyV1
        .version,
      1,
    );
  });

  it('tracks pending media vs synced meta', () => {
    const meta = withSyncedMediaAssetIds({}, ['a']);
    assert.deepEqual(
      pendingMediaAssetIds(
        { imageAssetIds: ['a', 'b'], videoAssetIds: ['c'] },
        meta,
      ),
      ['b', 'c'],
    );
  });

  it('detects revision conflicts (future multi-device)', () => {
    assert.equal(
      detectListingDraftRevisionConflict({
        localRevision: 2,
        remoteRevision: 5,
      }),
      true,
    );
    assert.equal(
      detectListingDraftRevisionConflict({
        localRevision: 5,
        remoteRevision: 5,
      }),
      false,
    );
    assert.ok(
      compareListingDraftFreshness(
        { revision: 3, updatedAt: '2020-01-01T00:00:00.000Z' },
        { revision: 2, updatedAt: '2026-01-01T00:00:00.000Z' },
      ) > 0,
    );
  });
});
