import { Injectable } from '@nestjs/common';
import { ListingStatus, Prisma, type SavedSearch, type SearchEvent } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { SearchFilters, SearchSort } from '../domain/search.types';

/** Lean include — one query, no N+1 for list cards. */
const discoveryInclude = {
  translations: {
    where: { deletedAt: null },
    take: 2,
    orderBy: { language: 'asc' as const },
    select: {
      language: true,
      title: true,
      description: true,
    },
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
    select: {
      id: true,
      code: true,
      slug: true,
      nameEn: true,
      nameAr: true,
    },
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

export type DiscoveryListing = Prisma.ListingGetPayload<{
  include: typeof discoveryInclude;
}>;

@Injectable()
export class DiscoveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(filters: SearchFilters): Promise<{
    items: DiscoveryListing[];
    total: number;
  }> {
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters.sort, Boolean(filters.q?.trim()));

    const [total, items] = await this.prisma.$transaction([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: discoveryInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total };
  }

  private buildWhere(filters: SearchFilters): Prisma.ListingWhereInput {
    const and: Prisma.ListingWhereInput[] = [
      { deletedAt: null },
      { status: ListingStatus.ACTIVE },
    ];

    if (filters.categoryId) and.push({ categoryId: filters.categoryId });
    if (filters.categoryCode) and.push({ categoryCode: filters.categoryCode });
    if (filters.cityId) and.push({ cityId: filters.cityId });
    if (filters.governorateId) {
      and.push({ city: { governorateId: filters.governorateId } });
    }
    if (filters.conditionTypeId) {
      and.push({ conditionTypeId: filters.conditionTypeId });
    }
    if (filters.featuredOnly) and.push({ isFeatured: true });
    if (filters.verifiedOnly) and.push({ isVerified: true });

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      and.push({
        primaryPrice: {
          gte: filters.minPrice,
          lte: filters.maxPrice,
        },
      });
    }

    const vehicleFilter = this.buildVehicleFilter(filters);
    if (vehicleFilter) and.push(vehicleFilter);

    const q = filters.q?.trim();
    if (q) {
      and.push(this.buildKeywordFilter(q));
    }

    return { AND: and };
  }

  /**
   * Keyword strategy:
   * 1) Prisma Postgres FTS (`search`) on translation title/description
   * 2) ILIKE fallbacks on slug/meta + plate numbers
   * GIN FTS index: ListingTranslation_fts_idx (migration)
   */
  private buildKeywordFilter(q: string): Prisma.ListingWhereInput {
    const like = q;
    return {
      OR: [
        {
          translations: {
            some: {
              deletedAt: null,
              OR: [
                { title: { search: q } },
                { description: { search: q } },
                { title: { contains: like, mode: 'insensitive' } },
                { description: { contains: like, mode: 'insensitive' } },
              ],
            },
          },
        },
        { slug: { contains: like, mode: 'insensitive' } },
        { metaTitle: { contains: like, mode: 'insensitive' } },
        {
          plateDetails: {
            is: {
              OR: [
                { plateDisplay: { contains: like, mode: 'insensitive' } },
                { plateNormalized: { contains: like.toUpperCase(), mode: 'insensitive' } },
              ],
            },
          },
        },
      ],
    };
  }

  private buildVehicleFilter(
    filters: SearchFilters,
  ): Prisma.ListingWhereInput | undefined {
    const hasVehicleDims =
      filters.brandId ||
      filters.modelId ||
      filters.minYear !== undefined ||
      filters.maxYear !== undefined ||
      filters.minMileage !== undefined ||
      filters.maxMileage !== undefined ||
      filters.fuelTypeId ||
      filters.transmissionTypeId ||
      filters.bodyTypeId ||
      filters.colorId ||
      filters.driveTypeId;

    if (!hasVehicleDims) return undefined;

    const year =
      filters.minYear !== undefined || filters.maxYear !== undefined
        ? { gte: filters.minYear, lte: filters.maxYear }
        : undefined;
    const mileageKm =
      filters.minMileage !== undefined || filters.maxMileage !== undefined
        ? { gte: filters.minMileage, lte: filters.maxMileage }
        : undefined;

    const shared = {
      brandId: filters.brandId,
      modelId: filters.modelId,
      year,
      mileageKm,
      fuelTypeId: filters.fuelTypeId,
      deletedAt: null as null,
    };

    return {
      OR: [
        {
          carDetails: {
            is: {
              ...shared,
              transmissionTypeId: filters.transmissionTypeId,
              bodyTypeId: filters.bodyTypeId,
              colorId: filters.colorId,
              driveTypeId: filters.driveTypeId,
            },
          },
        },
        {
          motorcycleDetails: {
            is: {
              brandId: filters.brandId,
              modelId: filters.modelId,
              year,
              mileageKm,
              fuelTypeId: filters.fuelTypeId,
              colorId: filters.colorId,
              deletedAt: null,
            },
          },
        },
        {
          truckDetails: {
            is: {
              brandId: filters.brandId,
              modelId: filters.modelId,
              year,
              mileageKm,
              fuelTypeId: filters.fuelTypeId,
              transmissionTypeId: filters.transmissionTypeId,
              deletedAt: null,
            },
          },
        },
      ],
    };
  }

  private buildOrderBy(
    sort: SearchSort | undefined,
    hasKeyword: boolean,
  ): Prisma.ListingOrderByWithRelationInput[] {
    switch (sort) {
      case SearchSort.OLDEST:
        return [{ createdAt: 'asc' }];
      case SearchSort.PRICE_LOW:
        return [{ primaryPrice: 'asc' }, { createdAt: 'desc' }];
      case SearchSort.PRICE_HIGH:
        return [{ primaryPrice: 'desc' }, { createdAt: 'desc' }];
      case SearchSort.MOST_VIEWED:
        return [{ viewsCount: 'desc' }, { createdAt: 'desc' }];
      case SearchSort.MOST_RELEVANT:
        // Featured + verified boost, then views (FTS rank approximated without raw SQL join)
        return [
          { isFeatured: 'desc' },
          { isVerified: 'desc' },
          { viewsCount: 'desc' },
          { publishedAt: 'desc' },
        ];
      case SearchSort.NEWEST:
      default:
        if (hasKeyword && !sort) {
          return [
            { isFeatured: 'desc' },
            { viewsCount: 'desc' },
            { publishedAt: 'desc' },
          ];
        }
        return [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
    }
  }

  // ── Suggestions ────────────────────────────────────────────────────────────

  async suggestBrands(q: string, take: number) {
    return this.prisma.vehicleBrand.findMany({
      where: {
        active: true,
        deletedAt: null,
        OR: [
          { nameEn: { contains: q, mode: 'insensitive' } },
          { nameAr: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, nameEn: true, nameAr: true, slug: true, category: true },
      take,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async suggestModels(q: string, take: number) {
    return this.prisma.vehicleModel.findMany({
      where: {
        active: true,
        deletedAt: null,
        OR: [
          { nameEn: { contains: q, mode: 'insensitive' } },
          { nameAr: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
        brandId: true,
        brand: { select: { id: true, nameEn: true, nameAr: true } },
      },
      take,
      orderBy: { nameEn: 'asc' },
    });
  }

  async suggestCities(q: string, take: number) {
    return this.prisma.city.findMany({
      where: {
        active: true,
        deletedAt: null,
        OR: [
          { nameEn: { contains: q, mode: 'insensitive' } },
          { nameAr: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
        governorateId: true,
        governorate: { select: { id: true, nameEn: true, nameAr: true } },
      },
      take,
      orderBy: { nameEn: 'asc' },
    });
  }

  async suggestPlates(q: string, take: number) {
    return this.prisma.plateDetails.findMany({
      where: {
        deletedAt: null,
        listing: { deletedAt: null, status: ListingStatus.ACTIVE },
        OR: [
          { plateDisplay: { contains: q, mode: 'insensitive' } },
          { plateNormalized: { contains: q.toUpperCase(), mode: 'insensitive' } },
        ],
      },
      select: {
        listingId: true,
        plateDisplay: true,
        plateNormalized: true,
        formatCode: true,
      },
      take,
    });
  }

  async suggestKeywords(q: string, take: number) {
    return this.prisma.popularKeyword.findMany({
      where: {
        active: true,
        keyword: { contains: q, mode: 'insensitive' },
      },
      orderBy: { hitCount: 'desc' },
      take,
      select: { keyword: true, hitCount: true },
    });
  }

  // ── Trending / analytics ───────────────────────────────────────────────────

  async trendingBrands(since: Date, take: number) {
    return this.prisma.searchEvent.groupBy({
      by: ['brandId'],
      where: {
        createdAt: { gte: since },
        brandId: { not: null },
      },
      _count: { brandId: true },
      orderBy: { _count: { brandId: 'desc' } },
      take,
    });
  }

  async trendingModels(since: Date, take: number) {
    return this.prisma.searchEvent.groupBy({
      by: ['modelId'],
      where: {
        createdAt: { gte: since },
        modelId: { not: null },
      },
      _count: { modelId: true },
      orderBy: { _count: { modelId: 'desc' } },
      take,
    });
  }

  async trendingCategories(since: Date, take: number) {
    return this.prisma.searchEvent.groupBy({
      by: ['categoryId'],
      where: {
        createdAt: { gte: since },
        categoryId: { not: null },
      },
      _count: { categoryId: true },
      orderBy: { _count: { categoryId: 'desc' } },
      take,
    });
  }

  findBrandsByIds(ids: string[]) {
    return this.prisma.vehicleBrand.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, nameEn: true, nameAr: true, slug: true, category: true },
    });
  }

  findModelsByIds(ids: string[]) {
    return this.prisma.vehicleModel.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
        brandId: true,
      },
    });
  }

  findCategoriesByIds(ids: string[]) {
    return this.prisma.category.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true,
        code: true,
        slug: true,
        nameEn: true,
        nameAr: true,
      },
    });
  }

  async recordEvent(input: {
    userId?: string;
    sessionId?: string;
    keyword?: string;
    categoryId?: string;
    brandId?: string;
    modelId?: string;
    cityId?: string;
    governorateId?: string;
    filters?: Prisma.InputJsonValue;
    resultCount: number;
  }) {
    await this.prisma.searchEvent.create({ data: input });

    const keyword = input.keyword?.trim().toLowerCase();
    if (keyword && keyword.length >= 2) {
      await this.prisma.popularKeyword.upsert({
        where: { keyword },
        create: {
          keyword,
          hitCount: 1,
          lastHitAt: new Date(),
        },
        update: {
          hitCount: { increment: 1 },
          lastHitAt: new Date(),
          active: true,
        },
      });
    }
  }

  recentForUser(userId: string, take: number): Promise<SearchEvent[]> {
    return this.prisma.searchEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: take * 3, // fetch extra then dedupe in service
    });
  }

  // ── Saved searches ─────────────────────────────────────────────────────────

  createSaved(input: {
    userId: string;
    name?: string;
    query?: string;
    filters: Prisma.InputJsonValue;
    sort: string;
    notify?: boolean;
  }): Promise<SavedSearch> {
    return this.prisma.savedSearch.create({ data: input });
  }

  listSaved(userId: string): Promise<SavedSearch[]> {
    return this.prisma.savedSearch.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  findSaved(id: string, userId: string): Promise<SavedSearch | null> {
    return this.prisma.savedSearch.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  softDeleteSaved(id: string): Promise<SavedSearch> {
    return this.prisma.savedSearch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
