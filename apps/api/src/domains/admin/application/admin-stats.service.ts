import { Injectable } from '@nestjs/common';
import { ListingStatus } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(range: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const since = this.since(range);

    const [listingsCreated, usersCreated, searchEvents, sold] = await Promise.all([
      this.prisma.listing.count({
        where: { deletedAt: null, createdAt: { gte: since } },
      }),
      this.prisma.user.count({
        where: { deletedAt: null, createdAt: { gte: since } },
      }),
      this.prisma.searchEvent.count({
        where: { createdAt: { gte: since } },
      }),
      this.prisma.listing.count({
        where: {
          deletedAt: null,
          status: ListingStatus.SOLD,
          soldAt: { gte: since },
        },
      }),
    ]);

    const [topBrands, topCities, topSearched, topDealers] = await Promise.all([
      this.topBrands(since),
      this.topCities(since),
      this.topSearched(since),
      this.topDealers(),
    ]);

    return {
      range,
      since: since.toISOString(),
      listingsCreated,
      usersCreated,
      searchEvents,
      sold,
      topBrands,
      topCities,
      topSearched,
      topDealers,
    };
  }

  private since(range: 'daily' | 'weekly' | 'monthly') {
    const d = new Date();
    if (range === 'daily') d.setDate(d.getDate() - 1);
    else if (range === 'weekly') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    return d;
  }

  private async topBrands(since: Date) {
    const rows = await this.prisma.carDetails.groupBy({
      by: ['brandId'],
      where: {
        brandId: { not: null },
        listing: { deletedAt: null, createdAt: { gte: since } },
      },
      _count: { brandId: true },
      orderBy: { _count: { brandId: 'desc' } },
      take: 10,
    });

    const brands = await this.prisma.vehicleBrand.findMany({
      where: { id: { in: rows.map((r) => r.brandId!).filter(Boolean) } },
    });
    const map = new Map(brands.map((b) => [b.id, b]));

    return rows.map((r) => ({
      brandId: r.brandId,
      nameEn: map.get(r.brandId!)?.nameEn ?? 'Unknown',
      count: r._count.brandId,
    }));
  }

  private async topCities(since: Date) {
    const rows = await this.prisma.listing.groupBy({
      by: ['cityId'],
      where: { deletedAt: null, createdAt: { gte: since } },
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 10,
    });
    const cities = await this.prisma.city.findMany({
      where: { id: { in: rows.map((r) => r.cityId) } },
    });
    const map = new Map(cities.map((c) => [c.id, c]));
    return rows.map((r) => ({
      cityId: r.cityId,
      nameEn: map.get(r.cityId)?.nameEn ?? 'Unknown',
      nameAr: map.get(r.cityId)?.nameAr ?? 'Unknown',
      count: r._count.cityId,
    }));
  }

  private async topSearched(since: Date) {
    const rows = await this.prisma.$queryRaw<Array<{ keyword: string; count: bigint }>>`
      SELECT keyword, COUNT(*)::bigint AS count
      FROM "SearchEvent"
      WHERE "createdAt" >= ${since}
        AND keyword IS NOT NULL
        AND TRIM(keyword) <> ''
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT 10
    `;
    return rows.map((r) => ({ keyword: r.keyword, count: Number(r.count) }));
  }

  private async topDealers() {
    const dealers = await this.prisma.dealerOrganization.findMany({
      where: { deletedAt: null },
      orderBy: [{ viewsCount: 'desc' }, { followersCount: 'desc' }],
      take: 10,
      include: {
        members: { where: { deletedAt: null }, select: { userId: true } },
      },
    });

    const result: Array<{
      id: string;
      name: string;
      slug: string;
      verified: boolean;
      followers: number;
      views: number;
      cars: number;
    }> = [];

    for (const dealer of dealers) {
      const memberIds = dealer.members.map((m) => m.userId);
      const cars = memberIds.length
        ? await this.prisma.listing.count({
            where: {
              deletedAt: null,
              sellerId: { in: memberIds },
              status: { in: [ListingStatus.ACTIVE, ListingStatus.SOLD] },
            },
          })
        : 0;
      result.push({
        id: dealer.id,
        name: dealer.name,
        slug: dealer.slug,
        verified: dealer.verified,
        followers: dealer.followersCount,
        views: dealer.viewsCount,
        cars,
      });
    }
    return result.sort((a, b) => b.cars - a.cars || b.views - a.views).slice(0, 10);
  }
}
