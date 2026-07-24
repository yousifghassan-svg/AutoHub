import { Injectable } from '@nestjs/common';
import { ListingCategoryCode, ListingStatus } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const [
      totalUsers,
      totalDealers,
      totalCars,
      totalPlates,
      activeListings,
      soldListings,
      pendingListings,
      archivedListings,
      todaysListings,
      thisMonthListings,
      viewsAgg,
      favoritesAgg,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null, status: { not: 'DELETED' } } }),
      this.prisma.dealerOrganization.count({ where: { deletedAt: null } }),
      this.prisma.listing.count({
        where: { deletedAt: null, categoryCode: ListingCategoryCode.CAR },
      }),
      this.prisma.listing.count({
        where: { deletedAt: null, categoryCode: ListingCategoryCode.PLATE },
      }),
      this.prisma.listing.count({
        where: { deletedAt: null, status: ListingStatus.ACTIVE },
      }),
      this.prisma.listing.count({
        where: { deletedAt: null, status: ListingStatus.SOLD },
      }),
      this.prisma.listing.count({
        where: { deletedAt: null, status: ListingStatus.PENDING },
      }),
      this.prisma.listing.count({
        where: { deletedAt: null, status: ListingStatus.ARCHIVED },
      }),
      this.prisma.listing.count({
        where: { deletedAt: null, createdAt: { gte: startOfToday } },
      }),
      this.prisma.listing.count({
        where: { deletedAt: null, createdAt: { gte: startOfMonth } },
      }),
      this.prisma.listing.aggregate({
        where: { deletedAt: null },
        _sum: { viewsCount: true },
      }),
      this.prisma.listing.aggregate({
        where: { deletedAt: null },
        _sum: { favoritesCount: true },
      }),
    ]);

    return {
      totalUsers,
      totalDealers,
      totalCars,
      totalPlates,
      activeListings,
      soldListings,
      pendingListings,
      archivedListings,
      todaysListings,
      thisMonthListings,
      totalViews: viewsAgg._sum.viewsCount ?? 0,
      totalFavorites: favoritesAgg._sum.favoritesCount ?? 0,
    };
  }
}
