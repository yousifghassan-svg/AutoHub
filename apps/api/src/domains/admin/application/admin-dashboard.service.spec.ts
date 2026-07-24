import { ListingCategoryCode, ListingStatus } from '@autohub/database';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  const prisma = {
    user: { count: jest.fn() },
    dealerOrganization: { count: jest.fn() },
    listing: { count: jest.fn(), aggregate: jest.fn() },
  };

  const service = new AdminDashboardService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.count.mockResolvedValue(12);
    prisma.dealerOrganization.count.mockResolvedValue(4);
    prisma.listing.count.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.categoryCode === ListingCategoryCode.CAR) return 100;
      if (where.categoryCode === ListingCategoryCode.PLATE) return 200;
      if (where.status === ListingStatus.ACTIVE) return 250;
      if (where.status === ListingStatus.SOLD) return 20;
      if (where.status === ListingStatus.PENDING) return 5;
      if (where.status === ListingStatus.ARCHIVED) return 10;
      return 3;
    });
    prisma.listing.aggregate
      .mockResolvedValueOnce({ _sum: { viewsCount: 999 } })
      .mockResolvedValueOnce({ _sum: { favoritesCount: 77 } });
  });

  it('aggregates marketplace KPIs', async () => {
    const summary = await service.getSummary();
    expect(summary).toEqual({
      totalUsers: 12,
      totalDealers: 4,
      totalCars: 100,
      totalPlates: 200,
      activeListings: 250,
      soldListings: 20,
      pendingListings: 5,
      archivedListings: 10,
      todaysListings: 3,
      thisMonthListings: 3,
      totalViews: 999,
      totalFavorites: 77,
    });
  });
});
