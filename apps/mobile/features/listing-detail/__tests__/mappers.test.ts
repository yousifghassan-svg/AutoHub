import { mapApiMedia, mapListingDetail } from '../domain/mappers';

describe('listing detail mappers', () => {
  it('maps media kinds and sorts by sortOrder', () => {
    const media = mapApiMedia([
      {
        id: '2',
        r2Key: 'b.jpg',
        thumbnailKey: null,
        mediaType: 'VIDEO',
        mimeType: 'video/mp4',
        sortOrder: 2,
      },
      {
        id: '1',
        r2Key: 'a.jpg',
        thumbnailKey: 'a.t.jpg',
        mediaType: 'IMAGE',
        mimeType: 'image/jpeg',
        sortOrder: 0,
      },
      {
        id: '3',
        r2Key: 'c',
        thumbnailKey: null,
        mediaType: 'MEDIA_360',
        mimeType: null,
        sortOrder: 1,
      },
    ]);

    expect(media.map((m) => m.id)).toEqual(['1', '3', '2']);
    expect(media[1].kind).toBe('360_MEDIA');
    expect(media[2].kind).toBe('VIDEO');
  });

  it('maps listing detail with specs and seller placeholder', () => {
    const detail = mapListingDetail(
      {
        id: 'lst-9',
        sellerId: 'user-1',
        slug: 'camry',
        categoryCode: 'CAR',
        primaryPrice: 1000,
        primaryCurrencyId: 'IQD',
        secondaryPrice: null,
        secondaryCurrencyId: null,
        isFeatured: true,
        isVerified: true,
        viewsCount: 10,
        favoritesCount: 2,
        publishedAt: null,
        cityId: 'c1',
        translations: [
          { language: 'ar', title: 'كامري', description: 'وصف' },
          { language: 'en', title: 'Camry', description: 'Desc' },
        ],
        media: [
          {
            id: 'm1',
            r2Key: 'x.jpg',
            thumbnailKey: null,
            mediaType: 'IMAGE',
            mimeType: 'image/jpeg',
            sortOrder: 0,
          },
        ],
        category: { code: 'CAR', nameEn: 'Cars', nameAr: 'سيارات' },
        city: {
          id: 'c1',
          nameEn: 'Baghdad',
          nameAr: 'بغداد',
          governorate: { nameEn: 'Baghdad', nameAr: 'بغداد' },
        },
        carDetails: { year: 2019, mileageKm: 12000, brandId: 'toyota', engineSizeCc: 2500 },
      },
      'ar',
      null,
    );

    expect(detail.title).toBe('كامري');
    expect(detail.description).toBe('وصف');
    expect(detail.locationLabel).toContain('بغداد');
    expect(detail.specs.some((s) => s.key === 'year' && s.value === '2019')).toBe(true);
    expect(detail.seller.phone).toBeNull();
    expect(detail.media).toHaveLength(1);
  });
});
