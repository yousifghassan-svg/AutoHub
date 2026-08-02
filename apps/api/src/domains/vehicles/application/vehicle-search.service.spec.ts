import { ListingStatus } from '@autohub/database';
import { VehicleSearchService } from './vehicle-search.service';

describe('VehicleSearchService (P4-2)', () => {
  const vehicles = {
    search: jest.fn(),
  };
  const vehiclesService = {
    mapVehicleResponse: jest.fn((item: unknown) => item),
  };
  const searchAnalytics = {
    recordAnalytics: jest.fn(),
  };

  const service = new VehicleSearchService(
    vehicles as never,
    vehiclesService as never,
    searchAnalytics as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    vehicles.search.mockResolvedValue({
      items: [{ id: 'v1', isFeatured: true }],
      total: 1,
    });
  });

  it('defaults to relevance sort when keyword is present and sortBy omitted', async () => {
    const result = await service.search({ keyword: 'Camry', page: 1, pageSize: 12 });

    expect(vehicles.search).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'Camry',
        sortBy: 'relevance',
        sortOrder: 'desc',
        statuses: [ListingStatus.ACTIVE],
      }),
    );
    expect(result.sortBy).toBe('relevance');
    expect(result.sortOrder).toBe('desc');
  });

  it('keeps createdAt default when no keyword', async () => {
    const result = await service.search({ page: 1, pageSize: 12 });

    expect(vehicles.search).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'createdAt',
      }),
    );
    expect(result.sortBy).toBe('createdAt');
  });

  it('honors explicit sortBy over keyword relevance default', async () => {
    await service.search({
      keyword: 'Camry',
      sortBy: 'primaryPrice',
      sortOrder: 'asc',
      page: 1,
      pageSize: 12,
    });

    expect(vehicles.search).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'primaryPrice',
        sortOrder: 'asc',
      }),
    );
  });

  it('records vehicle-scoped analytics after search', async () => {
    await service.search({
      keyword: 'Tesla',
      brandId: 'brand-1',
      cityId: 'city-1',
      categoryCode: 'CAR' as never,
      currencyCode: 'IQD',
      minPrice: 1_000_000,
      maxPrice: 50_000_000,
      page: 1,
      pageSize: 12,
    });

    expect(searchAnalytics.recordAnalytics).toHaveBeenCalledTimes(1);
    expect(searchAnalytics.recordAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'Tesla',
        brandId: 'brand-1',
        cityId: 'city-1',
        resultCount: 1,
        filters: expect.objectContaining({
          domain: 'VEHICLE',
          categoryCode: 'CAR',
          currencyCode: 'IQD',
          minPrice: 1_000_000,
          maxPrice: 50_000_000,
          sortBy: 'relevance',
        }),
      }),
    );
  });

  it('records analytics even when keyword is absent', async () => {
    await service.search({ page: 1, pageSize: 12, cityId: 'city-1' });

    expect(searchAnalytics.recordAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: undefined,
        cityId: 'city-1',
        resultCount: 1,
      }),
    );
  });
});
