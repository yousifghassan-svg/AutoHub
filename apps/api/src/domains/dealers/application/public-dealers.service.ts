import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, Prisma } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

const inventoryInclude = {
  translations: {
    where: { deletedAt: null },
    take: 2,
    orderBy: { language: 'asc' as const },
    select: { language: true, title: true, description: true },
  },
  media: {
    where: { deletedAt: null },
    take: 1,
    orderBy: { sortOrder: 'asc' as const },
    select: {
      id: true,
      r2Key: true,
      thumbnailKey: true,
      mediaType: true,
      sortOrder: true,
    },
  },
  category: {
    select: { id: true, code: true, slug: true, nameEn: true, nameAr: true },
  },
  city: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      governorateId: true,
      governorate: {
        select: { id: true, code: true, nameEn: true, nameAr: true },
      },
    },
  },
  carDetails: {
    select: {
      brandId: true,
      modelId: true,
      year: true,
      mileageKm: true,
      fuelTypeId: true,
      transmissionTypeId: true,
      bodyTypeId: true,
      driveTypeId: true,
    },
  },
  motorcycleDetails: {
    select: {
      brandId: true,
      modelId: true,
      year: true,
      mileageKm: true,
      fuelTypeId: true,
    },
  },
  truckDetails: {
    select: {
      brandId: true,
      modelId: true,
      year: true,
      mileageKm: true,
      fuelTypeId: true,
      transmissionTypeId: true,
    },
  },
  plateDetails: {
    select: {
      plateDisplay: true,
      plateNormalized: true,
      formatCode: true,
    },
  },
} satisfies Prisma.ListingInclude;

type InventoryListing = Prisma.ListingGetPayload<{ include: typeof inventoryInclude }>;

@Injectable()
export class PublicDealersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    q?: string;
    verifiedOnly?: boolean;
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where: Prisma.DealerOrganizationWhereInput = {
      deletedAt: null,
      verified: query.verifiedOnly ? true : undefined,
      OR: query.q?.trim()
        ? [
            { name: { contains: query.q.trim(), mode: 'insensitive' } },
            { slug: { contains: query.q.trim(), mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [total, dealers] = await Promise.all([
      this.prisma.dealerOrganization.count({ where }),
      this.prisma.dealerOrganization.findMany({
        where,
        include: {
          city: {
            select: {
              id: true,
              slug: true,
              nameEn: true,
              nameAr: true,
              governorateId: true,
            },
          },
          members: {
            where: { deletedAt: null },
            select: { userId: true },
          },
        },
        orderBy: [{ verified: 'desc' }, { followersCount: 'desc' }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const memberIds = [...new Set(dealers.flatMap((d) => d.members.map((m) => m.userId)))];
    const listingCountsBySeller =
      memberIds.length > 0
        ? await this.prisma.listing.groupBy({
            by: ['sellerId'],
            where: {
              deletedAt: null,
              status: ListingStatus.ACTIVE,
              sellerId: { in: memberIds },
            },
            _count: { _all: true },
          })
        : [];

    const countBySeller = new Map(
      listingCountsBySeller.map((row) => [row.sellerId, row._count._all]),
    );

    const items = dealers.map((dealer) => {
      const listingCount = dealer.members.reduce(
        (sum, member) => sum + (countBySeller.get(member.userId) ?? 0),
        0,
      );

      return {
        id: dealer.id,
        name: dealer.name,
        slug: dealer.slug,
        verified: dealer.verified,
        bio: dealer.bio,
        phone: dealer.phone,
        whatsapp: dealer.whatsapp,
        address: dealer.address,
        coverImageUrl: dealer.coverImageUrl,
        logoUrl: dealer.logoUrl,
        openingHours: dealer.openingHours,
        city: dealer.city,
        statistics: {
          listingCount,
          followers: dealer.followersCount,
          views: dealer.viewsCount,
        },
      };
    });

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
    };
  }

  async getBySlug(slug: string) {
    const dealer = await this.prisma.dealerOrganization.findFirst({
      where: { slug, deletedAt: null },
      include: {
        city: {
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameAr: true,
            governorateId: true,
            governorate: {
              select: { id: true, code: true, nameEn: true, nameAr: true },
            },
          },
        },
        members: {
          where: { deletedAt: null },
          select: { userId: true },
        },
      },
    });

    if (!dealer) throw new NotFoundException('Dealer not found');

    const memberIds = dealer.members.map((m) => m.userId);
    const inventoryPageSize = 20;
    const listingWhere: Prisma.ListingWhereInput = {
      deletedAt: null,
      status: ListingStatus.ACTIVE,
      sellerId: memberIds.length > 0 ? { in: memberIds } : { in: [] },
    };

    const [activeListings, sold, views, inventoryTotal, inventoryItems] =
      await Promise.all([
        memberIds.length > 0
          ? this.prisma.listing.count({ where: listingWhere })
          : Promise.resolve(0),
        memberIds.length > 0
          ? this.prisma.listing.count({
              where: {
                deletedAt: null,
                sellerId: { in: memberIds },
                status: ListingStatus.SOLD,
              },
            })
          : Promise.resolve(0),
        memberIds.length > 0
          ? this.prisma.listing.aggregate({
              where: { deletedAt: null, sellerId: { in: memberIds } },
              _sum: { viewsCount: true },
            })
          : Promise.resolve({ _sum: { viewsCount: null } }),
        memberIds.length > 0
          ? this.prisma.listing.count({ where: listingWhere })
          : Promise.resolve(0),
        memberIds.length > 0
          ? this.prisma.listing.findMany({
              where: listingWhere,
              include: inventoryInclude,
              orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
              take: inventoryPageSize,
            })
          : Promise.resolve([] as InventoryListing[]),
      ]);

    return {
      id: dealer.id,
      name: dealer.name,
      slug: dealer.slug,
      verified: dealer.verified,
      bio: dealer.bio,
      phone: dealer.phone,
      whatsapp: dealer.whatsapp,
      address: dealer.address,
      coverImageUrl: dealer.coverImageUrl,
      logoUrl: dealer.logoUrl,
      openingHours: dealer.openingHours,
      city: dealer.city,
      statistics: {
        activeListings,
        sold,
        views: views._sum.viewsCount ?? dealer.viewsCount,
        followers: dealer.followersCount,
      },
      reviews: {
        placeholder: true,
        message: 'Dealer reviews coming soon',
        averageRating: null,
        count: 0,
        items: [],
      },
      inventory: {
        items: inventoryItems.map((listing) => this.toCard(listing)),
        page: 1,
        pageSize: inventoryPageSize,
        total: inventoryTotal,
        totalPages: Math.ceil(inventoryTotal / inventoryPageSize) || 0,
      },
    };
  }

  private toCard(listing: InventoryListing) {
    return {
      id: listing.id,
      slug: listing.slug,
      status: listing.status,
      categoryCode: listing.categoryCode,
      primaryPrice:
        listing.primaryPrice != null ? Number(listing.primaryPrice) : null,
      primaryCurrencyId: listing.primaryCurrencyId,
      cityId: listing.cityId,
      governorateId: listing.city.governorateId,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      viewsCount: listing.viewsCount,
      publishedAt: listing.publishedAt,
      createdAt: listing.createdAt,
      title: listing.translations[0]?.title ?? listing.metaTitle ?? listing.slug,
      thumbnailKey: listing.media[0]?.thumbnailKey ?? listing.media[0]?.r2Key ?? null,
      category: listing.category,
      city: {
        id: listing.city.id,
        nameEn: listing.city.nameEn,
        nameAr: listing.city.nameAr,
        governorate: listing.city.governorate,
      },
      carDetails: listing.carDetails,
      motorcycleDetails: listing.motorcycleDetails,
      truckDetails: listing.truckDetails,
      plateDetails: listing.plateDetails,
    };
  }
}
