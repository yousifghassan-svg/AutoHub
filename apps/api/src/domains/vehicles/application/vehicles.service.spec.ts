import { NotFoundException } from '@nestjs/common';
import { ListingCategoryCode, ListingStatus } from '@autohub/database';
import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  const vehicles = {
    findById: jest.fn(),
    list: jest.fn(),
    client: { listing: { update: jest.fn() } },
  };
  const listings = {
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    changeStatus: jest.fn(),
    recordContactClick: jest.fn(),
  };
  const validation = {
    assertCategory: jest.fn(),
  };

  const service = new VehiclesService(
    vehicles as never,
    listings as never,
    validation as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns vehicle not found for missing listing', async () => {
    vehicles.findById.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
  });

  it('rejects PLATE category on create', async () => {
    validation.assertCategory.mockResolvedValue({
      id: 'cat-1',
      code: ListingCategoryCode.PLATE,
    });

    await expect(
      service.create(
        { id: 'u1', role: 'USER', permissions: [] } as never,
        {
          categoryId: 'cat-1',
          cityId: 'city-1',
          title: 'Test',
          description: 'Test description long enough',
        },
      ),
    ).rejects.toThrow('PLATE category is not allowed');
  });

  it('delegates contact click to listings service', async () => {
    vehicles.findById.mockResolvedValue({
      id: 'v1',
      status: ListingStatus.ACTIVE,
      sellerId: 'u1',
      city: { governorateId: 'gov-1' },
      translations: [],
      media: [],
      category: { id: 'c1', code: ListingCategoryCode.CAR },
      features: [],
    });
    listings.recordContactClick.mockResolvedValue({ ok: true, phoneClicks: 1 });

    await service.contactClick('v1', 'phone');
    expect(listings.recordContactClick).toHaveBeenCalledWith('v1', 'phone');
  });
});
