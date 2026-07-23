import { mapListingToCard, formatPrice, formatMileage, resolveCurrencyCode } from '../domain/mappers';

describe('home mappers', () => {
  it('maps listing API payload to card model', () => {
    const card = mapListingToCard(
      {
        id: '1',
        slug: 'camry-2019',
        primaryPrice: 1000,
        primaryCurrencyId: 'IQD',
        isFeatured: true,
        isVerified: true,
        categoryCode: 'CAR',
        translations: [
          { language: 'en', title: 'Camry 2019' },
          { language: 'ar', title: 'كامري 2019' },
        ],
        media: [{ r2Key: 'a.jpg', thumbnailKey: 'a.thumb.jpg', sortOrder: 0 }],
        city: { nameEn: 'Baghdad', nameAr: 'بغداد' },
        carDetails: { year: 2019, mileageKm: 45000 },
      },
      'ar',
    );

    expect(card.title).toBe('كامري 2019');
    expect(card.location).toBe('بغداد');
    expect(card.year).toBe(2019);
    expect(card.mileageKm).toBe(45000);
    expect(card.isFeatured).toBe(true);
    expect(card.thumbnailKey).toBe('a.thumb.jpg');
  });

  it('formats price and mileage', () => {
    expect(formatPrice(null, 'IQD')).toBe('—');
    expect(formatMileage(null)).toBeNull();
    expect(formatMileage(1000)).toContain('1');
    expect(resolveCurrencyCode(null)).toBe('IQD');
    expect(resolveCurrencyCode('USD')).toBe('USD');
  });
});
