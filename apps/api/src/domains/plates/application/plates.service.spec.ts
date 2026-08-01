import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@autohub/database';
import { PlatesService } from './plates.service';
import { Permission } from '../../auth/domain/permissions';

describe('PlatesService', () => {
  const plates = {
    findById: jest.fn(),
    search: jest.fn(),
    create: jest.fn(),
    updateWithDetails: jest.fn(),
    softDelete: jest.fn(),
    findDuplicateNormalized: jest.fn(),
    findFormatByCode: jest.fn(),
    findCityWithGovernorate: jest.fn(),
  };
  const catalog = {
    verifyPlate: jest.fn(),
  };
  const listings = {
    changeStatus: jest.fn(),
    recordContactClick: jest.fn(),
  };
  const currencies = {
    assertPrice: jest.fn(),
    resolvePrimaryCurrency: jest.fn().mockResolvedValue({ id: 'curr_iqd', code: 'IQD' }),
  };

  const service = new PlatesService(
    plates as never,
    catalog as never,
    listings as never,
    currencies as never,
  );

  const owner = {
    id: 'owner-1',
    role: 'USER' as const,
    permissions: [Permission.LISTINGS_CREATE, Permission.LISTINGS_UPDATE],
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

  const plateListing = {
    id: 'P1',
    domain: 'PLATE',
    status: ListingStatus.DRAFT,
    sellerId: owner.id,
    plateDetails: {
      regionCode: '22',
      series: 'X',
      number: '99099',
      plateNormalized: '22X99099',
      formatCode: 'IQ_ERBIL',
    },
    translations: [{ language: 'ar', title: 'Plate', description: 'Desc' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    plates.findDuplicateNormalized.mockResolvedValue(null);
    plates.findFormatByCode.mockResolvedValue({ code: 'IQ_ERBIL' });
    plates.findCityWithGovernorate.mockResolvedValue({
      governorate: { countryId: 'IQ' },
    });
  });

  it('creates draft plate listing with PLATE domain via repository', async () => {
    plates.create.mockResolvedValue(plateListing);

    await service.create(owner, {
      categoryId: 'cat-plate',
      cityId: 'city-1',
      title: 'Erbil plate',
      description: 'Nice plate',
      primaryPrice: 15_000_000,
      currencyCode: 'IQD',
      formatCode: 'IQ_ERBIL',
      regionCode: '22',
      series: 'X',
      number: '99099',
    });

    expect(plates.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ListingStatus.DRAFT,
        plateDetails: expect.objectContaining({
          create: expect.objectContaining({
            format: { connect: { code: 'IQ_ERBIL' } },
            plateNormalized: '22X99099',
          }),
        }),
      }),
    );
  });

  it('hides non-active plates from anonymous viewers', async () => {
    plates.findById.mockResolvedValue({
      ...plateListing,
      status: ListingStatus.DRAFT,
    });

    await expect(service.findById('P1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('forbids non-owner updates', async () => {
    plates.findById.mockResolvedValue({
      ...plateListing,
      sellerId: 'other-user',
    });

    await expect(
      service.update('P1', owner, { title: 'Updated' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not write listing status on content update', async () => {
    plates.findById.mockResolvedValue(plateListing);
    plates.updateWithDetails.mockResolvedValue({
      ...plateListing,
      translations: plateListing.translations,
    });

    await service.update('P1', owner, { title: 'Updated title' });

    expect(plates.updateWithDetails).toHaveBeenCalledWith(
      'P1',
      expect.objectContaining({
        listing: expect.not.objectContaining({ status: expect.anything() }),
      }),
    );
    expect(listings.changeStatus).not.toHaveBeenCalled();
  });

  it('lists only ACTIVE plates for anonymous callers', async () => {
    plates.search.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });

    await service.list({ page: 1 });

    expect(plates.search).toHaveBeenCalledWith(
      expect.objectContaining({ status: ListingStatus.ACTIVE }),
    );
  });
});
