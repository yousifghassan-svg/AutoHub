import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getWorkflowForMode } from './workflows';

describe('getWorkflowForMode (P5-9)', () => {
  it('keeps vehicle media step identical in edit', () => {
    const create = getWorkflowForMode('vehicle-listing', 'create');
    const edit = getWorkflowForMode('vehicle-listing', 'edit');
    assert.deepEqual(
      create.steps.map((s) => s.id),
      edit.steps.map((s) => s.id),
    );
  });

  it('inserts media into plate edit workflow', () => {
    const create = getWorkflowForMode('plate-listing', 'create');
    const edit = getWorkflowForMode('plate-listing', 'edit');
    assert.equal(
      create.steps.some((s) => s.id === 'media'),
      false,
    );
    assert.equal(
      edit.steps.some((s) => s.id === 'media'),
      true,
    );
    const mediaIdx = edit.steps.findIndex((s) => s.id === 'media');
    const saleIdx = edit.steps.findIndex((s) => s.id === 'saleInformation');
    assert.ok(mediaIdx >= 0 && saleIdx > mediaIdx);
  });
});
