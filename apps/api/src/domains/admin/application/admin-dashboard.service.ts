import { Injectable } from '@nestjs/common';
import { ListingStatus, MarketplaceDomain, Prisma } from '@autohub/database';
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
      currencyStats,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null, status: { not: 'DELETED' } } }),
      this.prisma.dealerOrganization.count({ where: { deletedAt: null } }),
      this.prisma.listing.count({
        where: { deletedAt: null, domain: MarketplaceDomain.VEHICLE },
      }),
      this.prisma.listing.count({
        where: { deletedAt: null, domain: MarketplaceDomain.PLATE },
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
      this.buildCurrencyStats(),
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
      currency: currencyStats,
    };
  }

  private async buildCurrencyStats() {
    const currencies = await this.prisma.currency.findMany({
      where: { active: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      select: { id: true, code: true, symbol: true, decimalPlaces: true },
    });

    const activeBase: Prisma.ListingWhereInput = {
      deletedAt: null,
      status: ListingStatus.ACTIVE,
    };

    const byCurrency = await Promise.all(
      currencies.map(async (currency) => {
        const [vehicles, plates, avgAgg] = await Promise.all([
          this.prisma.listing.count({
            where: {
              ...activeBase,
              domain: MarketplaceDomain.VEHICLE,
              primaryCurrencyId: currency.id,
            },
          }),
          this.prisma.listing.count({
            where: {
              ...activeBase,
              domain: MarketplaceDomain.PLATE,
              primaryCurrencyId: currency.id,
            },
          }),
          this.prisma.listing.aggregate({
            where: {
              ...activeBase,
              primaryCurrencyId: currency.id,
              primaryPrice: { not: null },
            },
            _avg: { primaryPrice: true },
            _count: { _all: true },
          }),
        ]);

        return {
          currencyCode: currency.code,
          symbol: currency.symbol,
          decimalPlaces: currency.decimalPlaces,
          vehicles,
          plates,
          averagePrice:
            avgAgg._avg.primaryPrice != null
              ? Number(avgAgg._avg.primaryPrice)
              : null,
          pricedListings: avgAgg._count._all,
        };
      }),
    );

    return {
      vehiclesByCurrency: byCurrency.map((row) => ({
        currencyCode: row.currencyCode,
        count: row.vehicles,
      })),
      platesByCurrency: byCurrency.map((row) => ({
        currencyCode: row.currencyCode,
        count: row.plates,
      })),
      averagePriceByCurrency: byCurrency.map((row) => ({
        currencyCode: row.currencyCode,
        averagePrice: row.averagePrice,
        pricedListings: row.pricedListings,
      })),
      breakdown: byCurrency,
    };
  }
}
