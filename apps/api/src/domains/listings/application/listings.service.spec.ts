import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { ListingStatus, MediaAssetStatus, MediaType } from '@autohub/database';
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

  it.each([ListingStatus.SOLD, ListingStatus.ARCHIVED])(
    'rejects content update when status is %s (SEC-002)',
    async (status) => {
      listings.findById.mockResolvedValue({
        id: 'L1',
        sellerId: owner.id,
        status,
        city: { governorateId: 'g1' },
        translations: [],
        media: [],
        category: {
          id: 'c1',
          code: 'CAR',
          slug: 'cars',
          nameEn: 'Cars',
          nameAr: 'سيارات',
        },
      });

      await expect(
        service.update('L1', owner, { title: 'New title' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(listings.updateWithTranslation).not.toHaveBeenCalled();
    },
  );

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

  describe('addMedia trust (P5-4)', () => {
    const draftListing = {
      id: 'L1',
      sellerId: owner.id,
      status: ListingStatus.DRAFT,
      city: { governorateId: 'g1' },
      translations: [],
      media: [],
      category: {
        id: 'c1',
        code: 'CAR',
        slug: 'cars',
        nameEn: 'Cars',
        nameAr: 'سيارات',
      },
    };

    it('rejects seller bare r2Key attach', async () => {
      listings.findById.mockResolvedValue(draftListing);

      await expect(
        service.addMedia('L1', owner, {
          mediaType: 'IMAGE',
          r2Key: 'uploads/evil.jpg',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(media.create).not.toHaveBeenCalled();
    });

    it('rejects foreign mediaAssetId for sellers', async () => {
      listings.findById.mockResolvedValue(draftListing);
      mediaAssets.findById.mockResolvedValue({
        id: 'asset-1',
        status: MediaAssetStatus.READY,
        ownerId: 'someone-else',
        originalKey: 'k',
        mimeType: 'image/jpeg',
        byteSize: 100,
        width: 1,
        height: 1,
        variants: [],
        documentPurpose: null,
      });

      await expect(
        service.addMedia('L1', owner, {
          mediaType: 'IMAGE',
          mediaAssetId: 'asset-1',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects null-owner mediaAssetId for sellers', async () => {
      listings.findById.mockResolvedValue(draftListing);
      mediaAssets.findById.mockResolvedValue({
        id: 'asset-1',
        status: MediaAssetStatus.READY,
        ownerId: null,
        originalKey: 'k',
        mimeType: 'image/jpeg',
        byteSize: 100,
        width: 1,
        height: 1,
        variants: [],
        documentPurpose: null,
      });

      await expect(
        service.addMedia('L1', owner, {
          mediaType: 'IMAGE',
          mediaAssetId: 'asset-1',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects non-READY mediaAssetId', async () => {
      listings.findById.mockResolvedValue(draftListing);
      mediaAssets.findById.mockResolvedValue({
        id: 'asset-1',
        status: MediaAssetStatus.PENDING_UPLOAD,
        ownerId: owner.id,
        originalKey: 'k',
        mimeType: 'image/jpeg',
        byteSize: 100,
        width: 1,
        height: 1,
        variants: [],
        documentPurpose: null,
      });

      await expect(
        service.addMedia('L1', owner, {
          mediaType: 'IMAGE',
          mediaAssetId: 'asset-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows seller attach of owned READY mediaAssetId', async () => {
      listings.findById.mockResolvedValue(draftListing);
      mediaAssets.findById.mockResolvedValue({
        id: 'asset-1',
        status: MediaAssetStatus.READY,
        ownerId: owner.id,
        originalKey: 'owner/key.jpg',
        mimeType: 'image/jpeg',
        byteSize: 100,
        width: 10,
        height: 10,
        variants: [],
        documentPurpose: null,
      });
      media.countActive.mockResolvedValue(0);
      media.nextSortOrder.mockResolvedValue(0);
      media.create.mockResolvedValue({
        id: 'lm1',
        listingId: 'L1',
        mediaAssetId: 'asset-1',
        r2Key: 'owner/key.jpg',
        thumbnailKey: null,
        sortOrder: 0,
        mediaType: MediaType.IMAGE,
        mimeType: 'image/jpeg',
        byteSize: 100,
        width: 10,
        height: 10,
        confirmed: true,
        documentPurpose: null,
        createdAt: new Date(),
      });
      mediaAssets.update.mockResolvedValue({});

      await service.addMedia('L1', owner, {
        mediaType: 'IMAGE',
        mediaAssetId: 'asset-1',
      });

      expect(media.create).toHaveBeenCalledWith(
        expect.objectContaining({
          r2Key: 'owner/key.jpg',
          mediaAsset: { connect: { id: 'asset-1' } },
        }),
      );
    });

    it('allows moderator bare r2Key escape', async () => {
      listings.findById.mockResolvedValue(draftListing);
      media.countActive.mockResolvedValue(0);
      media.nextSortOrder.mockResolvedValue(0);
      thumbnails.generate.mockResolvedValue({
        thumbnailKey: 't.jpg',
        mimeType: 'image/jpeg',
        byteSize: 1,
        width: 1,
        height: 1,
      });
      media.create.mockResolvedValue({
        id: 'lm1',
        listingId: 'L1',
        mediaAssetId: null,
        r2Key: 'staff/key.jpg',
        thumbnailKey: 't.jpg',
        sortOrder: 0,
        mediaType: MediaType.IMAGE,
        mimeType: 'image/jpeg',
        byteSize: 1,
        width: 1,
        height: 1,
        confirmed: true,
        documentPurpose: null,
        createdAt: new Date(),
      });

      await service.addMedia('L1', admin, {
        mediaType: 'IMAGE',
        r2Key: 'staff/key.jpg',
      });

      expect(media.create).toHaveBeenCalled();
    });
  });
});
