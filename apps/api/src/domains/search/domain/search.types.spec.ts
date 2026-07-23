import { SearchSort } from './search.types';

describe('SearchSort', () => {
  it('exposes all required sort modes', () => {
    expect(Object.values(SearchSort)).toEqual(
      expect.arrayContaining([
        'NEWEST',
        'OLDEST',
        'PRICE_LOW',
        'PRICE_HIGH',
        'MOST_VIEWED',
        'MOST_RELEVANT',
      ]),
    );
  });
});
