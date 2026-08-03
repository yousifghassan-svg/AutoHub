import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatRelativeUpdated } from './relative-time';

describe('formatRelativeUpdated (P5-8)', () => {
  const now = Date.parse('2026-08-03T12:00:00.000Z');

  it('handles missing and recent timestamps', () => {
    assert.equal(formatRelativeUpdated(null, now), 'Updated recently');
    assert.equal(
      formatRelativeUpdated('2026-08-03T11:59:30.000Z', now),
      'Updated just now',
    );
  });

  it('formats hours and days', () => {
    assert.equal(
      formatRelativeUpdated('2026-08-03T09:00:00.000Z', now),
      'Updated 3h ago',
    );
    assert.equal(
      formatRelativeUpdated('2026-08-01T12:00:00.000Z', now),
      'Updated 2d ago',
    );
  });
});
