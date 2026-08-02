import { buildVehicleOrderBy } from './vehicle-sort';

describe('buildVehicleOrderBy', () => {
  it('returns heuristic cascade for relevance', () => {
    expect(buildVehicleOrderBy('relevance', 'desc')).toEqual([
      { isFeatured: 'desc' },
      { isVerified: 'desc' },
      { viewsCount: 'desc' },
      { publishedAt: 'desc' },
    ]);
  });

  it('preserves scalar sortBy/sortOrder for non-relevance sorts', () => {
    expect(buildVehicleOrderBy('createdAt', 'desc')).toEqual({
      createdAt: 'desc',
    });
    expect(buildVehicleOrderBy('primaryPrice', 'asc')).toEqual({
      primaryPrice: 'asc',
    });
    expect(buildVehicleOrderBy('publishedAt', 'desc')).toEqual({
      publishedAt: 'desc',
    });
  });
});
