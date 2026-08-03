import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  normalizeClientMediaType,
  validateClientMediaFile,
} from './client-media-validation';

describe('client media validation (P5-4)', () => {
  it('normalizes 360_MEDIA', () => {
    assert.equal(normalizeClientMediaType('360_MEDIA'), 'MEDIA_360');
  });

  it('rejects oversized images', () => {
    const file = new File([new Uint8Array(16 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });
    const result = validateClientMediaFile(file, 'IMAGE');
    assert.equal(result.ok, false);
  });

  it('accepts jpeg within limit', () => {
    const file = new File([new Uint8Array(1024)], 'ok.jpg', {
      type: 'image/jpeg',
    });
    assert.equal(validateClientMediaFile(file, 'IMAGE').ok, true);
  });

  it('rejects video mime for IMAGE slot', () => {
    const file = new File([new Uint8Array(1024)], 'clip.mp4', {
      type: 'video/mp4',
    });
    assert.equal(validateClientMediaFile(file, 'IMAGE').ok, false);
  });
});
