import { Injectable } from '@nestjs/common';
import {
  ListingStatus,
  MarketplaceDomain,
  Prisma,
  type SavedSearch,
  type SearchEvent,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  SearchFilters,
  SearchSort,
  type SearchFacets,
} from '../domain/search.types';

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
  primaryCurrency: {
    select: {
      id: true,
      code: true,
      symbol: true,
      decimalPlaces: true,
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
    const where = await this.buildWhere(filters);
    const q = filters.q?.trim();
    const useTsRank =
      filters.sort === SearchSort.MOST_RELEVANT && Boolean(q);

    if (useTsRank) {
      return this.searchWithTsRank(where, q!, page, pageSize);
    }

    const orderBy = this.buildOrderBy(filters.sort, Boolean(q));

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

  /**
   * MOST_RELEVANT + keyword: order by Postgres ts_rank over translation FTS,
   * then featured / verified / views / publishedAt.
   */
  private async searchWithTsRank(
    where: Prisma.ListingWhereInput,
    q: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: DiscoveryListing[]; total: number }> {
    const total = await this.prisma.listing.count({ where });
    if (total === 0) return { items: [], total: 0 };

    const candidates = await this.prisma.listing.findMany({
      where,
      select: { id: true },
      take: 2500,
    });
    if (candidates.length === 0) return { items: [], total };

    const ids = candidates.map((c) => c.id);
    const skip = (page - 1) * pageSize;
    const ranked = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT l.id
      FROM "Listing" l
      INNER JOIN "ListingTranslation" t
        ON t."listingId" = l.id AND t."deletedAt" IS NULL
      WHERE l.id IN (${Prisma.join(ids)})
      GROUP BY l.id, l."isFeatured", l."isVerified", l."viewsCount", l."publishedAt"
      ORDER BY
        MAX(
          ts_rank(
            to_tsvector('simple', coalesce(t.title, '') || ' ' || coalesce(t.description, '')),
            websearch_to_tsquery('simple', ${q})
          )
        ) DESC,
        l."isFeatured" DESC,
        l."isVerified" DESC,
        l."viewsCount" DESC,
        l."publishedAt" DESC NULLS LAST
      LIMIT ${pageSize}
      OFFSET ${skip}
    `;

    if (ranked.length === 0) return { items: [], total };

    const order = new Map(ranked.map((r, i) => [r.id, i]));
    const items = await this.prisma.listing.findMany({
      where: { id: { in: ranked.map((r) => r.id) } },
      include: discoveryInclude,
    });
    items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return { items, total };
  }

  /** Facet counts for the active filter set (disjunctive per dimension). */
  async facets(filters: SearchFilters): Promise<SearchFacets> {
    const base = await this.buildWhere({
      ...filters,
      categoryId: undefined,
      categoryCode: undefined,
      brandId: undefined,
      governorateId: undefined,
      cityId: undefined,
      featuredOnly: undefined,
      verifiedOnly: undefined,
      page: undefined,
      pageSize: undefined,
      sort: undefined,
    });

    const [
      categoryRows,
      brandRows,
      govRows,
      cityRows,
      featuredCount,
      verifiedCount,
    ] = await Promise.all([
      this.prisma.listing.groupBy({
        by: ['categoryId'],
        where: base,
        _count: { _all: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 40,
      }),
      this.facetBrandCounts(base),
      this.facetGovernorateCounts(base),
      this.facetCityCounts(base),
      this.prisma.listing.count({
        where: { AND: [base, { isFeatured: true }] },
      }),
      this.prisma.listing.count({
        where: { AND: [base, { isVerified: true }] },
      }),
    ]);

    const categoryIds = categoryRows.map((r) => r.categoryId);
    const categories = categoryIds.length
      ? await this.prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, nameEn: true, code: true },
        })
      : [];
    const catMeta = new Map(
      categories.map((c) => [c.id, { label: c.nameEn || c.code, code: c.code }]),
    );

    return {
      categories: categoryRows.map((r) => {
        const meta = catMeta.get(r.categoryId);
        return {
          id: r.categoryId,
          label: meta?.label ?? r.categoryId,
          code: meta?.code,
          count: r._count._all,
        };
      }),
      brands: brandRows,
      governorates: govRows,
      cities: cityRows,
      featured: { count: featuredCount },
      verified: { count: verifiedCount },
    };
  }

  private async facetBrandCounts(
    base: Prisma.ListingWhereInput,
  ): Promise<Array<{ id: string; label: string; count: number }>> {
    const listings = await this.prisma.listing.findMany({
      where: {
        AND: [
          base,
          {
            OR: [
              { carDetails: { is: { brandId: { not: null }, deletedAt: null } } },
              {
                motorcycleDetails: {
                  is: { brandId: { not: null }, deletedAt: null },
                },
              },
              {
                truckDetails: { is: { brandId: { not: null }, deletedAt: null } },
              },
            ],
          },
        ],
      },
      select: {
        carDetails: { select: { brandId: true } },
        motorcycleDetails: { select: { brandId: true } },
        truckDetails: { select: { brandId: true } },
      },
      take: 5000,
    });
    const counts = new Map<string, number>();
    for (const l of listings) {
      const brandId =
        l.carDetails?.brandId ??
        l.motorcycleDetails?.brandId ??
        l.truckDetails?.brandId;
      if (!brandId) continue;
      counts.set(brandId, (counts.get(brandId) ?? 0) + 1);
    }
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40);
    if (!top.length) return [];
    const brands = await this.prisma.vehicleBrand.findMany({
      where: { id: { in: top.map(([id]) => id) } },
      select: { id: true, nameEn: true },
    });
    const labels = new Map(brands.map((b) => [b.id, b.nameEn]));
    return top.map(([id, count]) => ({
      id,
      label: labels.get(id) ?? id,
      count,
    }));
  }

  private async facetGovernorateCounts(
    base: Prisma.ListingWhereInput,
  ): Promise<Array<{ id: string; label: string; count: number }>> {
    const listings = await this.prisma.listing.findMany({
      where: base,
      select: {
        city: { select: { governorateId: true, governorate: { select: { nameEn: true } } } },
      },
      take: 8000,
    });
    const counts = new Map<string, { label: string; count: number }>();
    for (const l of listings) {
      const id = l.city?.governorateId;
      if (!id) continue;
      const cur = counts.get(id);
      if (cur) cur.count += 1;
      else
        counts.set(id, {
          label: l.city?.governorate?.nameEn ?? id,
          count: 1,
        });
    }
    return [...counts.entries()]
      .map(([id, v]) => ({ id, label: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);
  }

  private async facetCityCounts(
    base: Prisma.ListingWhereInput,
  ): Promise<Array<{ id: string; label: string; count: number }>> {
    const rows = await this.prisma.listing.groupBy({
      by: ['cityId'],
      where: base,
      _count: { _all: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 40,
    });
    if (!rows.length) return [];
    const cities = await this.prisma.city.findMany({
      where: { id: { in: rows.map((r) => r.cityId) } },
      select: { id: true, nameEn: true },
    });
    const labels = new Map(cities.map((c) => [c.id, c.nameEn]));
    return rows.map((r) => ({
      id: r.cityId,
      label: labels.get(r.cityId) ?? r.cityId,
      count: r._count._all,
    }));
  }

  private async buildWhere(
    filters: SearchFilters,
  ): Promise<Prisma.ListingWhereInput> {
    const and: Prisma.ListingWhereInput[] = [
      { deletedAt: null },
      { status: ListingStatus.ACTIVE },
    ];

    if (filters.domain) {
      and.push({ domain: filters.domain });
    }

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

    const hasPriceFilter =
      filters.minPrice !== undefined || filters.maxPrice !== undefined;
    const hasPriceSort =
      filters.sort === SearchSort.PRICE_LOW ||
      filters.sort === SearchSort.PRICE_HIGH;
    if (filters.currencyCode) {
      and.push({
        primaryCurrency: { code: filters.currencyCode.toUpperCase() },
      });
    } else if (hasPriceFilter || hasPriceSort) {
      and.push({ primaryCurrency: { code: 'IQD' } });
    }
    if (hasPriceFilter) {
      and.push({
        primaryPrice: {
          gte: filters.minPrice,
          lte: filters.maxPrice,
        },
      });
    }

    const vehicleFilter = this.buildVehicleFilter(filters);
    if (vehicleFilter) and.push(vehicleFilter);

    const plateFilter = await this.buildPlateFilter(filters);
    if (plateFilter) and.push(plateFilter);

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

    const or: Prisma.ListingWhereInput[] = [
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
    ];

    // Heavy equipment has year only (no brandId FKs) — include when year filtered.
    if (year && !filters.brandId && !filters.modelId) {
      or.push({
        heavyEquipmentDetails: {
          is: {
            year,
            deletedAt: null,
          },
        },
      });
    }

    return { OR: or };
  }

  private async buildPlateFilter(
    filters: SearchFilters,
  ): Promise<Prisma.ListingWhereInput | undefined> {
    const hasPlateDims =
      filters.formatCode ||
      filters.prefix ||
      filters.series ||
      filters.number ||
      filters.digits != null ||
      filters.plateCategoryId ||
      filters.platePrefixId ||
      filters.plateVerificationStatus ||
      filters.domain === MarketplaceDomain.PLATE;

    if (
      !hasPlateDims &&
      filters.domain !== MarketplaceDomain.PLATE &&
      !filters.formatCode &&
      !filters.prefix &&
      !filters.series &&
      !filters.number &&
      filters.digits == null &&
      !filters.plateCategoryId &&
      !filters.platePrefixId &&
      !filters.plateVerificationStatus
    ) {
      return undefined;
    }

    // Only apply plate detail constraints when plate-specific filters are set.
    const plateSpecific =
      filters.formatCode ||
      filters.prefix ||
      filters.series ||
      filters.number ||
      filters.digits != null ||
      filters.plateCategoryId ||
      filters.platePrefixId ||
      filters.plateVerificationStatus;

    if (!plateSpecific) return undefined;

    const plate: Prisma.PlateDetailsWhereInput = { deletedAt: null };
    if (filters.formatCode) {
      plate.formatCode = filters.formatCode.trim();
    }
    if (filters.series) {
      plate.series = { equals: filters.series.trim().toUpperCase() };
    }
    if (filters.prefix) {
      const p = filters.prefix.trim().toUpperCase();
      plate.OR = [
        { series: { equals: p } },
        { platePrefix: { is: { letter: p } } },
      ];
    }
    if (filters.number) {
      plate.number = { contains: filters.number.trim() };
    }
    if (filters.plateCategoryId) {
      plate.plateCategoryId = filters.plateCategoryId;
    }
    if (filters.platePrefixId) {
      plate.platePrefixId = filters.platePrefixId;
    }
    if (filters.plateVerificationStatus) {
      plate.verificationStatus = filters.plateVerificationStatus;
    }

    const and: Prisma.ListingWhereInput[] = [
      { plateDetails: { is: plate } },
    ];

    if (filters.digits != null) {
      const rows = await this.prisma.$queryRaw<{ listingId: string }[]>`
        SELECT "listingId"
        FROM "PlateDetails"
        WHERE "deletedAt" IS NULL
          AND length(
            regexp_replace(COALESCE("number", ''), '[^0-9]', '', 'g')
          ) = ${filters.digits}
      `;
      const ids = rows.map((r) => r.listingId);
      if (ids.length === 0) {
        and.push({ id: { in: [] } });
      } else {
        and.push({ id: { in: ids } });
      }
    }

    return { AND: and };
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
