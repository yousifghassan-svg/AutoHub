import { ListingStatus, MarketplaceDomain } from '@autohub/database';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  const prisma = {
    user: { count: jest.fn() },
    dealerOrganization: { count: jest.fn() },
    listing: { count: jest.fn(), aggregate: jest.fn() },
    currency: { findMany: jest.fn() },
  };

  const service = new AdminDashboardService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.count.mockResolvedValue(12);
    prisma.dealerOrganization.count.mockResolvedValue(4);
    prisma.listing.count.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.domain === MarketplaceDomain.VEHICLE && where.primaryCurrencyId) return 40;
      if (where.domain === MarketplaceDomain.PLATE && where.primaryCurrencyId) return 10;
      if (where.domain === MarketplaceDomain.VEHICLE) return 100;
      if (where.domain === MarketplaceDomain.PLATE) return 200;
      if (where.status === ListingStatus.ACTIVE) return 250;
      if (where.status === ListingStatus.SOLD) return 20;
      if (where.status === ListingStatus.PENDING) return 5;
      if (where.status === ListingStatus.ARCHIVED) return 10;
      return 3;
    });
    prisma.listing.aggregate
      .mockResolvedValueOnce({ _sum: { viewsCount: 999 } })
      .mockResolvedValueOnce({ _sum: { favoritesCount: 77 } })
      .mockResolvedValue({
        _avg: { primaryPrice: 15000 },
        _count: { _all: 50 },
      });
    prisma.currency.findMany.mockResolvedValue([
      { id: 'curr_iqd', code: 'IQD', symbol: 'د.ع', decimalPlaces: 0 },
      { id: 'curr_usd', code: 'USD', symbol: '$', decimalPlaces: 2 },
    ]);
  });

  it('aggregates marketplace KPIs and currency stats', async () => {
    const summary = await service.getSummary();
    expect(summary.totalUsers).toBe(12);
    expect(summary.totalDealers).toBe(4);
    expect(summary.totalCars).toBe(100);
    expect(summary.totalPlates).toBe(200);
    expect(summary.activeListings).toBe(250);
    expect(summary.totalViews).toBe(999);
    expect(summary.totalFavorites).toBe(77);
    expect(summary.currency.vehiclesByCurrency).toEqual([
      { currencyCode: 'IQD', count: 40 },
      { currencyCode: 'USD', count: 40 },
    ]);
    expect(summary.currency.averagePriceByCurrency[0]).toMatchObject({
      currencyCode: 'IQD',
      averagePrice: 15000,
    });
  });
});
