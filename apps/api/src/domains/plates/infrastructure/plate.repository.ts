import { Injectable } from '@nestjs/common';
import {
  ListingCategoryCode,
  ListingStatus,
  MarketplaceDomain,
  PlateVerificationStatus,
  Prisma,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  PLATE_DEFAULT_PAGE_SIZE,
  PLATE_MAX_PAGE_SIZE,
  type PlateSortBy,
} from '../domain/plate.constants';

export const plateListingInclude = {
  translations: { where: { deletedAt: null } },
  plateDetails: {
    include: {
      format: { include: { governorate: true } },
      plateCategory: true,
      platePrefix: true,
    },
  },
  media: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
  category: true,
  city: { include: { governorate: true } },
  country: true,
  primaryCurrency: true,
  seller: {
    select: {
      id: true,
      displayName: true,
      phone: true,
      role: true,
    },
  },
} satisfies Prisma.ListingInclude;

export type PlateListingWithRelations = Prisma.ListingGetPayload<{
  include: typeof plateListingInclude;
}>;

export type PlateSearchParams = {
  page?: number;
  pageSize?: number;
  sortBy?: PlateSortBy;
  sortOrder?: 'asc' | 'desc';
  governorateId?: string;
  province?: string;
  formatCode?: string;
  prefix?: string;
  series?: string;
  number?: string;
  digits?: number;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  plateCategoryId?: string;
  platePrefixId?: string;
  plateType?: string;
  verificationStatus?: PlateVerificationStatus;
  status?: ListingStatus;
  statuses?: ListingStatus[];
  sellerId?: string;
  keyword?: string;
  includeDeleted?: boolean;
};

@Injectable()
export class PlateRepository {
  constructor(private readonly prisma: PrismaService) {}

  private baseWhere(): Prisma.ListingWhereInput {
    return {
      domain: MarketplaceDomain.PLATE,
      categoryCode: ListingCategoryCode.PLATE,
    };
  }

  findFormatByCode(code: string) {
    return this.prisma.plateFormat.findUnique({ where: { code } });
  }

  findCityWithGovernorate(cityId: string) {
    return this.prisma.city.findUniqueOrThrow({
      where: { id: cityId },
      include: { governorate: true },
    });
  }

  async updateWithDetails(
    id: string,
    input: {
      listing: {
        cityId?: string;
        primaryPrice?: number | null;
        primaryCurrencyId?: string | null;
        updatedById: string;
      };
      plateDetails?: Prisma.PlateDetailsUpdateInput;
      translation?: {
        language: string;
        title: string;
        description: string;
        updatedById: string;
      };
    },
  ): Promise<PlateListingWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      if (input.plateDetails) {
        await tx.plateDetails.update({
          where: { listingId: id },
          data: input.plateDetails,
        });
      }

      if (input.translation) {
        await tx.listingTranslation.update({
          where: {
            listingId_language: {
              listingId: id,
              language: input.translation.language as never,
            },
          },
          data: {
            title: input.translation.title,
            description: input.translation.description,
            updatedById: input.translation.updatedById,
          },
        });
      }

      return tx.listing.update({
        where: { id },
        data: {
          cityId: input.listing.cityId,
          primaryPrice: input.listing.primaryPrice,
          primaryCurrencyId: input.listing.primaryCurrencyId,
          updatedById: input.listing.updatedById,
        },
        include: plateListingInclude,
      });
    });
  }

  findById(id: string): Promise<PlateListingWithRelations | null> {
    return this.prisma.listing.findFirst({
      where: {
        id,
        deletedAt: null,
        ...this.baseWhere(),
      },
      include: plateListingInclude,
    });
  }

  count(where: Prisma.ListingWhereInput): Promise<number> {
    return this.prisma.listing.count({ where });
  }

  findMany(params: {
    where: Prisma.ListingWhereInput;
    skip: number;
    take: number;
    orderBy: Prisma.ListingOrderByWithRelationInput;
  }): Promise<PlateListingWithRelations[]> {
    return this.prisma.listing.findMany({
      where: params.where,
      include: plateListingInclude,
      orderBy: params.orderBy,
      skip: params.skip,
      take: params.take,
    });
  }

  create(
    data: Omit<Prisma.ListingCreateInput, 'domain' | 'categoryCode'>,
  ): Promise<PlateListingWithRelations> {
    return this.prisma.listing.create({
      data: {
        ...data,
        domain: MarketplaceDomain.PLATE,
        categoryCode: ListingCategoryCode.PLATE,
      },
      include: plateListingInclude,
    });
  }

  update(
    id: string,
    data: Prisma.ListingUpdateInput,
  ): Promise<PlateListingWithRelations> {
    return this.prisma.listing.update({
      where: { id },
      data,
      include: plateListingInclude,
    });
  }

  softDelete(id: string, actorId: string): Promise<PlateListingWithRelations> {
    return this.update(id, {
      deletedAt: new Date(),
      status: ListingStatus.ARCHIVED,
      updatedBy: { connect: { id: actorId } },
    });
  }

  findDuplicateNormalized(
    normalized: string,
    excludeListingId?: string,
  ): Promise<{ listingId: string } | null> {
    return this.prisma.plateDetails.findFirst({
      where: {
        plateNormalized: normalized,
        listingId: excludeListingId ? { not: excludeListingId } : undefined,
        listing: {
          deletedAt: null,
          status: ListingStatus.ACTIVE,
          ...this.baseWhere(),
        },
      },
      select: { listingId: true },
    });
  }

  buildSearchWhere(params: PlateSearchParams): Prisma.ListingWhereInput {
    const plateFilter: Prisma.PlateDetailsWhereInput = {};

    if (params.formatCode) plateFilter.formatCode = params.formatCode;
    if (params.plateCategoryId) plateFilter.plateCategoryId = params.plateCategoryId;
    if (params.platePrefixId) plateFilter.platePrefixId = params.platePrefixId;
    if (params.plateType) {
      plateFilter.plateType = { equals: params.plateType, mode: 'insensitive' };
    }
    if (params.verificationStatus) {
      plateFilter.verificationStatus = params.verificationStatus;
    }
    if (params.series) {
      plateFilter.series = { equals: params.series.trim().toUpperCase() };
    }
    if (params.prefix) {
      plateFilter.OR = [
        { series: { equals: params.prefix.trim().toUpperCase() } },
        { platePrefix: { is: { letter: params.prefix.trim().toUpperCase() } } },
      ];
    }
    if (params.number) {
      plateFilter.number = { contains: params.number.trim() };
    }
    if (params.digits != null) {
      plateFilter.number = {
        ...(typeof plateFilter.number === 'object' ? plateFilter.number : {}),
        // PostgreSQL length filter via raw would be ideal; approximate with regex
      };
    }

    if (params.province?.trim()) {
      const province = params.province.trim();
      plateFilter.OR = [
        ...(plateFilter.OR ?? []),
        { regionCode: { equals: province, mode: 'insensitive' } },
        {
          format: {
            is: {
              OR: [
                { code: { contains: province.toUpperCase() } },
                { nameEn: { contains: province, mode: 'insensitive' } },
                { nameAr: { contains: province, mode: 'insensitive' } },
                {
                  governorate: {
                    is: {
                      OR: [
                        { code: { contains: province.toUpperCase() } },
                        { nameEn: { contains: province, mode: 'insensitive' } },
                        { nameAr: { contains: province, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      ];
    }

    if (params.governorateId) {
      plateFilter.format = {
        is: { governorateId: params.governorateId },
      };
    }

    if (params.keyword?.trim()) {
      const q = params.keyword.trim();
      plateFilter.OR = [
        ...(plateFilter.OR ?? []),
        { plateDisplay: { contains: q, mode: 'insensitive' } },
        { plateNormalized: { contains: q.replace(/\s+/g, '').toUpperCase() } },
      ];
    }

    const where: Prisma.ListingWhereInput = {
      ...this.baseWhere(),
      deletedAt: params.includeDeleted ? undefined : null,
      plateDetails: { is: plateFilter },
    };

    if (params.status) where.status = params.status;
    if (params.statuses?.length) where.status = { in: params.statuses };
    if (params.sellerId) where.sellerId = params.sellerId;

    const hasPriceFilter = params.minPrice != null || params.maxPrice != null;
    const hasPriceSort = params.sortBy === 'primaryPrice';
    if (params.currencyCode) {
      where.primaryCurrency = { code: params.currencyCode.toUpperCase() };
    } else if (hasPriceFilter || hasPriceSort) {
      where.primaryCurrency = { code: 'IQD' };
    }
    if (hasPriceFilter) {
      where.primaryPrice = {};
      if (params.minPrice != null) {
        where.primaryPrice.gte = params.minPrice;
      }
      if (params.maxPrice != null) {
        where.primaryPrice.lte = params.maxPrice;
      }
    }

    if (params.digits != null) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          plateDetails: {
            is: {
              number: { not: null },
            },
          },
        },
      ];
    }

    return where;
  }

  resolveSearchParams(params: PlateSearchParams): {
    page: number;
    pageSize: number;
    skip: number;
    sortBy: PlateSortBy;
    sortOrder: 'asc' | 'desc';
    where: Prisma.ListingWhereInput;
    orderBy: Prisma.ListingOrderByWithRelationInput;
  } {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? PLATE_DEFAULT_PAGE_SIZE, PLATE_MAX_PAGE_SIZE);
    const sortBy = params.sortBy ?? 'publishedAt';
    const sortOrder = params.sortOrder ?? 'desc';
    const where = this.buildSearchWhere(params);

    return {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
      sortBy,
      sortOrder,
      where,
      orderBy: { [sortBy]: sortOrder },
    };
  }

  async search(params: PlateSearchParams) {
    const resolved = this.resolveSearchParams(params);
    let items = await this.findMany({
      where: resolved.where,
      skip: resolved.skip,
      take: resolved.pageSize,
      orderBy: resolved.orderBy,
    });

    if (params.digits != null) {
      items = items.filter(
        (item) => item.plateDetails?.number?.replace(/\D/g, '').length === params.digits,
      );
    }

    const total = await this.count(resolved.where);

    return {
      items,
      page: resolved.page,
      pageSize: resolved.pageSize,
      total,
      totalPages: Math.ceil(total / resolved.pageSize) || 0,
    };
  }

  listActiveCategories() {
    return this.prisma.plateCategory.findMany({
      where: { active: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }

  listActivePrefixes(formatCode?: string) {
    return this.prisma.platePrefix.findMany({
      where: {
        active: true,
        deletedAt: null,
        ...(formatCode ? { formatCode } : {}),
      },
      orderBy: [{ formatCode: 'asc' }, { letter: 'asc' }],
    });
  }

  listProvinces() {
    return this.prisma.governorate.findMany({
      where: {
        active: true,
        deletedAt: null,
        plateFormats: { some: { active: true, deletedAt: null } },
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
      include: {
        plateFormats: {
          where: { active: true, deletedAt: null },
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  findCategoryById(id: string) {
    return this.prisma.plateCategory.findFirst({
      where: { id, deletedAt: null },
    });
  }

  findPrefixById(id: string) {
    return this.prisma.platePrefix.findFirst({
      where: { id, deletedAt: null },
    });
  }

  createCategory(data: Prisma.PlateCategoryCreateInput) {
    return this.prisma.plateCategory.create({ data });
  }

  updateCategory(id: string, data: Prisma.PlateCategoryUpdateInput) {
    return this.prisma.plateCategory.update({ where: { id }, data });
  }

  softDeleteCategory(id: string) {
    return this.prisma.plateCategory.update({
      where: { id },
      data: { active: false, deletedAt: new Date() },
    });
  }

  createPrefix(data: Prisma.PlatePrefixCreateInput) {
    return this.prisma.platePrefix.create({ data });
  }

  updatePrefix(id: string, data: Prisma.PlatePrefixUpdateInput) {
    return this.prisma.platePrefix.update({ where: { id }, data });
  }

  softDeletePrefix(id: string) {
    return this.prisma.platePrefix.update({
      where: { id },
      data: { active: false, deletedAt: new Date() },
    });
  }

  listAllCategories(includeInactive = false) {
    return this.prisma.plateCategory.findMany({
      where: includeInactive ? { deletedAt: null } : { deletedAt: null, active: true },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }

  listAllPrefixes(formatCode?: string, includeInactive = false) {
    return this.prisma.platePrefix.findMany({
      where: {
        deletedAt: null,
        ...(includeInactive ? {} : { active: true }),
        ...(formatCode ? { formatCode } : {}),
      },
      orderBy: [{ formatCode: 'asc' }, { letter: 'asc' }],
    });
  }

  listVerifications(params: { listingId?: string; page?: number; pageSize?: number }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? PLATE_DEFAULT_PAGE_SIZE, PLATE_MAX_PAGE_SIZE);
    const where: Prisma.PlateVerificationWhereInput = params.listingId
      ? { listingId: params.listingId }
      : {};

    return Promise.all([
      this.prisma.plateVerification.count({ where }),
      this.prisma.plateVerification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]).then(([total, items]) => ({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
    }));
  }

  async recordVerification(input: {
    listingId: string;
    status: PlateVerificationStatus;
    note?: string;
    actorId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.plateVerification.create({
        data: {
          listingId: input.listingId,
          status: input.status,
          note: input.note,
          actorId: input.actorId,
        },
      });

      return tx.plateDetails.update({
        where: { listingId: input.listingId },
        data: {
          verificationStatus: input.status,
          verifiedAt: input.status === PlateVerificationStatus.VERIFIED ? new Date() : null,
          verifiedById: input.actorId,
        },
        include: {
          format: true,
          plateCategory: true,
          platePrefix: true,
        },
      });
    });
  }
}
