import { mapManagedListing } from '../domain/mappers';

describe('mapManagedListing', () => {
  it('maps status, stats, and title', () => {
    const listing = mapManagedListing(
      {
        id: '1',
        slug: 'x',
        status: 'ACTIVE',
        categoryId: 'c',
        categoryCode: 'CAR',
        cityId: 'city',
        primaryPrice: 1000,
        primaryCurrencyId: 'IQD',
        isFeatured: true,
        isVerified: true,
        viewsCount: 50,
        favoritesCount: 3,
        publishedAt: null,
        soldAt: null,
        updatedAt: new Date().toISOString(),
        translations: [{ language: 'ar', title: 'سيارة', description: 'وصف طويل' }],
        city: { nameEn: 'Baghdad', nameAr: 'بغداد' },
        media: [],
      },
      'ar',
    );

    expect(listing.title).toBe('سيارة');
    expect(listing.status).toBe('ACTIVE');
    expect(listing.stats.views).toBe(50);
    expect(listing.stats.favorites).toBe(3);
    expect(listing.stats.phoneClicks).toBeNull();
    expect(listing.location).toBe('بغداد');
  });
});
