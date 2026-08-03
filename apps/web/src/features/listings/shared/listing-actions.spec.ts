import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ListingActions } from './listing-actions';

const ctx = {
  isOwner: true,
  listingId: 'L1',
  domain: 'VEHICLE' as const,
  surface: 'manage' as const,
};

describe('ListingActions manage surface (P5-8)', () => {
  it('labels draft edit as Continue draft and includes preview', () => {
    const actions = ListingActions.getActions('DRAFT', ctx);
    const edit = actions.find((a) => a.id === 'edit');
    assert.ok(edit && edit.kind === 'navigate');
    assert.equal(edit.label, 'Continue draft');
    assert.ok(actions.some((a) => a.id === 'preview_as_visitor'));
    assert.ok(actions.some((a) => a.id === 'duplicate'));
  });

  it('uses Archive label instead of Pause', () => {
    const actions = ListingActions.getActions('ACTIVE', ctx);
    const archive = actions.find((a) => a.id === 'pause');
    assert.ok(archive);
    assert.equal(archive.label, 'Archive');
  });

  it('requires owner', () => {
    assert.deepEqual(
      ListingActions.getActions('ACTIVE', { ...ctx, isOwner: false }),
      [],
    );
  });
});
