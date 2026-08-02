import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildVehicleSearchApiSort,
  toVehicleSearchQueryString,
} from './vehicle-search-api-query';

describe('vehicle search API query sort (freeze blocker)', () => {
  it('keyword + default (unspecified) sort → API receives no sortBy', () => {
    const sort = buildVehicleSearchApiSort(undefined, undefined);
    assert.equal(sort.sortBy, undefined);
    assert.equal(sort.sortOrder, undefined);

    const sp = new URLSearchParams(
      toVehicleSearchQueryString({ keyword: 'toyota', pageSize: 12 }),
    );
    assert.equal(sp.has('sortBy'), false);
    assert.equal(sp.has('sortOrder'), false);
    assert.equal(sp.get('keyword'), 'toyota');
  });

  it('keyword + explicit createdAt → createdAt sent', () => {
    const sp = new URLSearchParams(
      toVehicleSearchQueryString({
        keyword: 'toyota',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        pageSize: 12,
      }),
    );
    assert.equal(sp.get('sortBy'), 'createdAt');
    assert.equal(sp.get('sortOrder'), 'desc');
  });

  it('keyword + explicit relevance → relevance sent', () => {
    const sp = new URLSearchParams(
      toVehicleSearchQueryString({
        keyword: 'toyota',
        sortBy: 'relevance',
        sortOrder: 'desc',
        pageSize: 12,
      }),
    );
    assert.equal(sp.get('sortBy'), 'relevance');
    assert.equal(sp.get('sortOrder'), 'desc');
  });

  it('no keyword + default sort → sort omitted (API defaults createdAt)', () => {
    const sp = new URLSearchParams(
      toVehicleSearchQueryString({ pageSize: 12 }),
    );
    assert.equal(sp.has('sortBy'), false);
    assert.equal(sp.has('sortOrder'), false);
    assert.equal(sp.has('keyword'), false);
  });
});
