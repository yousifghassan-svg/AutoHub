import { NotFoundException } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchSort } from '../domain/search.types';

describe('SearchService', () => {
  const discovery = {
    search: jest.fn(),
    recordEvent: jest.fn(),
    suggestBrands: jest.fn(),
    suggestModels: jest.fn(),
    suggestCities: jest.fn(),
    suggestPlates: jest.fn(),
    suggestKeywords: jest.fn(),
    trendingBrands: jest.fn(),
    trendingModels: jest.fn(),
    trendingCategories: jest.fn(),
    findBrandsByIds: jest.fn(),
    findModelsByIds: jest.fn(),
    findCategoriesByIds: jest.fn(),
    recentForUser: jest.fn(),
    createSaved: jest.fn(),
    listSaved: jest.fn(),
    findSaved: jest.fn(),
    softDeleteSaved: jest.fn(),
  };

  const service = new SearchService(discovery as never);

  const user = {
    id: 'u1',
    role: 'USER' as const,
    permissions: [],
    firebaseUid: null,
    phone: null,
    email: null,
    displayName: null,
    status: 'ACTIVE',
    preferredLanguage: null,
    cityId: null,
    city: null,
    governorate: null,
    avatarUrl: null,
    avatarMediaId: null,
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    identityStatus: 'needs_profile' as const,
    profileCompletionPercent: 0,
    sellerProfile: null,
    notificationPreferences: {
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      newMessage: true,
      listingApproved: true,
      listingRejected: true,
      priceChange: true,
      favouriteUpdate: true,
      dealerReply: true,
      system: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    discovery.recordEvent.mockResolvedValue(undefined);
  });

  it('searches and records analytics event', async () => {
    discovery.search.mockResolvedValue({
      items: [
        {
          id: 'L1',
          slug: 'camry',
          status: 'ACTIVE',
          categoryCode: 'CAR',
          primaryPrice: 1000,
          primaryCurrencyId: null,
          cityId: 'c1',
          isFeatured: false,
          isVerified: false,
          viewsCount: 3,
          publishedAt: new Date(),
          createdAt: new Date(),
          metaTitle: null,
          translations: [{ title: 'Camry', description: 'x', language: 'en' }],
          media: [{ thumbnailKey: 't.jpg', r2Key: 'a.jpg' }],
          category: { id: 'cat', code: 'CAR', slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات' },
          city: {
            id: 'c1',
            nameEn: 'Erbil',
            nameAr: 'أربيل',
            governorateId: 'g1',
            governorate: { id: 'g1', code: 'EBL', nameEn: 'Erbil', nameAr: 'أربيل' },
          },
          carDetails: null,
          motorcycleDetails: null,
          truckDetails: null,
          plateDetails: null,
        },
      ],
      total: 1,
    });
    discovery.recordEvent.mockResolvedValue(undefined);

    const result = await service.search(
      { q: 'camry', brandId: 'b1', sort: SearchSort.NEWEST },
      user,
      'sess-1',
    );

    expect(result.total).toBe(1);
    expect(result.items[0]?.title).toBe('Camry');
    expect(discovery.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        keyword: 'camry',
        brandId: 'b1',
        resultCount: 1,
      }),
    );
  });

  it('aggregates autocomplete suggestion types', async () => {
    discovery.suggestBrands.mockResolvedValue([
      { id: 'b1', nameEn: 'Toyota', nameAr: 'تويوتا', slug: 'toyota', category: 'CAR' },
    ]);
    discovery.suggestModels.mockResolvedValue([]);
    discovery.suggestCities.mockResolvedValue([]);
    discovery.suggestPlates.mockResolvedValue([]);
    discovery.suggestKeywords.mockResolvedValue([{ keyword: 'toyota camry', hitCount: 9 }]);

    const suggestions = await service.suggestions('toy');
    expect(suggestions.some((s) => s.type === 'BRAND')).toBe(true);
    expect(suggestions.some((s) => s.type === 'KEYWORD')).toBe(true);
  });

  it('builds trending payload with batch lookups', async () => {
    discovery.trendingBrands.mockResolvedValue([
      { brandId: 'b1', _count: { brandId: 5 } },
    ]);
    discovery.trendingModels.mockResolvedValue([]);
    discovery.trendingCategories.mockResolvedValue([]);
    discovery.findBrandsByIds.mockResolvedValue([
      { id: 'b1', nameEn: 'Toyota', nameAr: 'تويوتا', slug: 'toyota', category: 'CAR' },
    ]);
    discovery.findModelsByIds.mockResolvedValue([]);
    discovery.findCategoriesByIds.mockResolvedValue([]);

    const trending = await service.trending(7, 10);
    expect(trending.brands[0]?.searchCount).toBe(5);
  });

  it('soft-deletes owned saved search', async () => {
    discovery.findSaved.mockResolvedValue({ id: 's1', userId: 'u1' });
    discovery.softDeleteSaved.mockResolvedValue({});

    await expect(service.deleteSaved(user, 's1')).resolves.toEqual({ success: true });
  });

  it('404s missing saved search', async () => {
    discovery.findSaved.mockResolvedValue(null);
    await expect(service.deleteSaved(user, 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
