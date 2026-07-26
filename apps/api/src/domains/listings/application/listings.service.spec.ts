import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { ListingStatus } from '@autohub/database';
import { ListingsService } from './listings.service';
import { Permission } from '../../auth/domain/permissions';

describe('ListingsService', () => {
  const listings = {
    findById: jest.fn(),
    update: jest.fn(),
    updateWithTranslation: jest.fn(),
    softDelete: jest.fn(),
    create: jest.fn(),
    search: jest.fn(),
    upsertTranslation: jest.fn(),
  };
  const media = {
    countActive: jest.fn(),
    nextSortOrder: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
  };
  const validation = {
    assertCategory: jest.fn(),
    assertLocation: jest.fn(),
    assertPrice: jest.fn(),
    assertCurrency: jest.fn(),
    assertBrandModel: jest.fn(),
    assertMediaType: jest.fn(),
    assertMediaLimits: jest.fn(),
  };
  const thumbnails = {
    generate: jest.fn().mockResolvedValue({ thumbnailKey: 'x.thumb.jpg' }),
  };
  const r2 = {
    deleteObject: jest.fn().mockResolvedValue(undefined),
  };
  const mediaAssets = {
    findById: jest.fn(),
    update: jest.fn(),
  };
  const notifications = {
    notifyListingStatus: jest.fn().mockResolvedValue(undefined),
  };
  const currencies = {
    resolvePrimaryCurrency: jest.fn().mockResolvedValue({ id: 'curr_iqd', code: 'IQD' }),
    assertActiveId: jest.fn().mockResolvedValue({ id: 'curr_usd', code: 'USD' }),
    getDefault: jest.fn().mockResolvedValue({ id: 'curr_iqd', code: 'IQD' }),
  };

  const service = new ListingsService(
    listings as never,
    media as never,
    validation as never,
    thumbnails as never,
    r2 as never,
    mediaAssets as never,
    notifications as never,
    currencies as never,
  );

  const owner = {
    id: 'owner-1',
    role: 'USER' as const,
    permissions: [
      Permission.LISTINGS_UPDATE,
      Permission.LISTINGS_CREATE,
      Permission.LISTINGS_DELETE,
    ],
    firebaseUid: null,
    phone: null,
    email: null,
    displayName: null,
    status: 'ACTIVE',
  };

  const admin = {
    ...owner,
    id: 'admin-1',
    role: 'ADMIN' as const,
    permissions: [Permission.LISTINGS_UPDATE, Permission.LISTINGS_MODERATE, Permission.ADMIN_ACCESS],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forbids non-owner updates', async () => {
    listings.findById.mockResolvedValue({
      id: 'L1',
      sellerId: 'someone-else',
      status: ListingStatus.DRAFT,
      city: { governorateId: 'g1' },
      translations: [],
      media: [],
      category: { id: 'c1', code: 'CAR', slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات' },
    });

    await expect(
      service.update('L1', owner, { title: 'New title' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admin to update any listing', async () => {
    const listing = {
      id: 'L1',
      sellerId: 'owner-1',
      status: ListingStatus.DRAFT,
      categoryId: 'cat',
      categoryCode: 'CAR',
      cityId: 'city',
      countryId: 'country',
      city: { governorateId: 'g1', id: 'city', slug: 'erbil', nameEn: 'Erbil', nameAr: 'أربيل' },
      translations: [{ language: 'ar', title: 'Old', description: 'desc' }],
      media: [],
      category: { id: 'c1', code: 'CAR', slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات' },
      carDetails: null,
      motorcycleDetails: null,
      truckDetails: null,
      heavyEquipmentDetails: null,
      plateDetails: null,
      primaryPrice: null,
      secondaryPrice: null,
      conditionTypeId: null,
      primaryCurrencyId: null,
      secondaryCurrencyId: null,
      slug: 'old',
      metaTitle: null,
      metaDescription: null,
      isFeatured: false,
      isVerified: false,
      verificationStatus: 'UNVERIFIED',
      viewsCount: 0,
      favoritesCount: 0,
      publishedAt: null,
      soldAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listings.findById.mockResolvedValue(listing);
    listings.updateWithTranslation.mockResolvedValue(listing);

    await service.update('L1', admin, { metaTitle: 'Admin edit' });
    expect(listings.updateWithTranslation).toHaveBeenCalled();
  });

  it('blocks owner from PENDING → ACTIVE', async () => {
    listings.findById.mockResolvedValue({
      id: 'L1',
      sellerId: owner.id,
      status: ListingStatus.PENDING,
      publishedAt: null,
      soldAt: null,
      city: { governorateId: 'g1' },
      translations: [],
      media: [],
      category: { id: 'c1', code: 'CAR', slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات' },
    });

    await expect(
      service.changeStatus('L1', owner, ListingStatus.ACTIVE),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows moderator to approve PENDING → ACTIVE', async () => {
    const listing = {
      id: 'L1',
      sellerId: owner.id,
      status: ListingStatus.PENDING,
      publishedAt: null,
      soldAt: null,
      city: { governorateId: 'g1', id: 'city', slug: 'erbil', nameEn: 'Erbil', nameAr: 'أربيل' },
      translations: [],
      media: [],
      category: { id: 'c1', code: 'CAR', slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات' },
      carDetails: null,
      motorcycleDetails: null,
      truckDetails: null,
      heavyEquipmentDetails: null,
      plateDetails: null,
      categoryId: 'c1',
      categoryCode: 'CAR',
      cityId: 'city',
      countryId: 'iq',
      conditionTypeId: null,
      primaryPrice: 1000,
      primaryCurrencyId: null,
      secondaryPrice: null,
      secondaryCurrencyId: null,
      slug: 'car',
      metaTitle: null,
      metaDescription: null,
      isFeatured: false,
      isVerified: false,
      verificationStatus: 'UNVERIFIED',
      viewsCount: 0,
      favoritesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    listings.findById.mockResolvedValue(listing);
    listings.update.mockResolvedValue({ ...listing, status: ListingStatus.ACTIVE });

    await service.changeStatus('L1', admin, ListingStatus.ACTIVE);
    expect(listings.update).toHaveBeenCalledWith(
      'L1',
      expect.objectContaining({ status: ListingStatus.ACTIVE }),
    );
  });

  it('rejects invalid transitions', async () => {
    listings.findById.mockResolvedValue({
      id: 'L1',
      sellerId: owner.id,
      status: ListingStatus.SOLD,
    });

    await expect(
      service.changeStatus('L1', owner, ListingStatus.ACTIVE),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
