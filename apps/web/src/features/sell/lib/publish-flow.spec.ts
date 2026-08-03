import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  friendlyPublishError,
  publishReviewWorkSteps,
  publishWorkStepIndex,
} from './publish-flow';

describe('publish flow copy (P5-7)', () => {
  it('exposes three friendly work steps', () => {
    const steps = publishReviewWorkSteps();
    assert.equal(steps.length, 3);
    assert.ok(steps.every((s) => s.label.length > 0));
    assert.equal(publishWorkStepIndex(steps, 'photos'), 1);
  });

  it('softens technical errors', () => {
    assert.match(friendlyPublishError('Failed to fetch'), /internet/i);
    assert.match(friendlyPublishError('401 Unauthorized'), /sign in/i);
    assert.match(
      friendlyPublishError('Media asset must be READY before attach'),
      /photos/i,
    );
    assert.match(friendlyPublishError('{ "statusCode": 500 }'), /try again/i);
    assert.equal(
      friendlyPublishError('City is required'),
      'City is required',
    );
  });
});
