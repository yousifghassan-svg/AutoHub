import { Injectable } from '@nestjs/common';
import {
  LanguageCode,
  ListingCategoryCode,
  ListingStatus,
  Prisma,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export type ListingSearchParams = {
  page: number;
  pageSize: number;
  sortBy: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder: 'asc' | 'desc';
  cityId?: string;
  governorateId?: string;
  categoryId?: string;
  categoryCode?: ListingCategoryCode;
  brandId?: string;
  modelId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  statuses?: ListingStatus[];
  isFeatured?: boolean;
  keyword?: string;
  sellerId?: string;
  includeDeleted?: boolean;
};

const listingInclude = {
  translations: { where: { deletedAt: null } },
  media: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
    include: {
      mediaAsset: {
        include: {
          variants: { where: { deletedAt: null } },
        },
      },
    },
  },
  category: true,
  city: { include: { governorate: true } },
  country: true,
  primaryCurrency: true,
  secondaryCurrency: true,
  carDetails: true,
  motorcycleDetails: true,
  truckDetails: true,
  heavyEquipmentDetails: true,
  plateDetails: true,
  seller: {
    select: {
      id: true,
      displayName: true,
      phone: true,
      role: true,
      dealerMemberships: {
        where: { deletedAt: null },
        take: 1,
        select: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              verified: true,
              phone: true,
              whatsapp: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ListingInclude;

export type ListingWithRelations = Prisma.ListingGetPayload<{
  include: typeof listingInclude;
}>;

@Injectable()
export class ListingRepository {
  constructor(private readonly prisma: PrismaService) {}

  get client() {
    return this.prisma;
  }

  findById(id: string): Promise<ListingWithRelations | null> {
    return this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      include: listingInclude,
    });
  }

  async create(data: Prisma.ListingCreateInput): Promise<ListingWithRelations> {
    return this.prisma.listing.create({
      data,
      include: listingInclude,
    });
  }

  async update(
    id: string,
    data: Prisma.ListingUpdateInput,
  ): Promise<ListingWithRelations> {
    return this.prisma.listing.update({
      where: { id },
      data,
      include: listingInclude,
    });
  }

  softDelete(id: string, updatedById: string): Promise<ListingWithRelations> {
    return this.prisma.listing.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ListingStatus.ARCHIVED,
        updatedBy: { connect: { id: updatedById } },
      },
      include: listingInclude,
    });
  }

  async search(params: ListingSearchParams): Promise<{
    items: ListingWithRelations[];
    total: number;
  }> {
    const where = this.buildWhere(params);
    const skip = (params.page - 1) * params.pageSize;

    // Lean list projection: cap media/translations (detail uses findById + full include).
    const listInclude = {
      ...listingInclude,
      translations: {
        where: { deletedAt: null },
        take: 2,
      },
      media: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' as const },
        take: 3,
      },
    } satisfies Prisma.ListingInclude;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: listInclude,
        orderBy: { [params.sortBy]: params.sortOrder },
        skip,
        take: params.pageSize,
      }),
    ]);

    return { items: items as ListingWithRelations[], total };
  }

  /** Atomically upsert translation + update listing core fields. */
  async updateWithTranslation(
    id: string,
    data: Prisma.ListingUpdateInput,
    translation?: {
      listingId: string;
      language: LanguageCode;
      title: string;
      description: string;
      userId: string;
    },
  ): Promise<ListingWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      if (translation) {
        await tx.listingTranslation.upsert({
          where: {
            listingId_language: {
              listingId: translation.listingId,
              language: translation.language,
            },
          },
          create: {
            listingId: translation.listingId,
            language: translation.language,
            title: translation.title,
            description: translation.description,
            createdById: translation.userId,
            updatedById: translation.userId,
          },
          update: {
            title: translation.title,
            description: translation.description,
            updatedById: translation.userId,
            deletedAt: null,
          },
        });
      }
      return tx.listing.update({
        where: { id },
        data,
        include: listingInclude,
      });
    });
  }

  private buildWhere(params: ListingSearchParams): Prisma.ListingWhereInput {
    const and: Prisma.ListingWhereInput[] = [];

    if (!params.includeDeleted) {
      and.push({ deletedAt: null });
    }

    if (params.sellerId) and.push({ sellerId: params.sellerId });
    if (params.cityId) and.push({ cityId: params.cityId });
    if (params.categoryId) and.push({ categoryId: params.categoryId });
    if (params.categoryCode) and.push({ categoryCode: params.categoryCode });
    if (params.isFeatured !== undefined) and.push({ isFeatured: params.isFeatured });

    if (params.status) {
      and.push({ status: params.status });
    } else if (params.statuses?.length) {
      and.push({ status: { in: params.statuses } });
    }

    if (params.governorateId) {
      and.push({ city: { governorateId: params.governorateId } });
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      and.push({
        primaryPrice: {
          gte: params.minPrice !== undefined ? params.minPrice : undefined,
          lte: params.maxPrice !== undefined ? params.maxPrice : undefined,
        },
      });
    }

    if (params.brandId || params.modelId) {
      and.push({
        OR: [
          {
            carDetails: {
              is: {
                brandId: params.brandId,
                modelId: params.modelId,
                deletedAt: null,
              },
            },
          },
          {
            motorcycleDetails: {
              is: {
                brandId: params.brandId,
                modelId: params.modelId,
                deletedAt: null,
              },
            },
          },
          {
            truckDetails: {
              is: {
                brandId: params.brandId,
                modelId: params.modelId,
                deletedAt: null,
              },
            },
          },
        ],
      });
    }

    if (params.keyword?.trim()) {
      const q = params.keyword.trim();
      and.push({
        OR: [
          { slug: { contains: q, mode: 'insensitive' } },
          { metaTitle: { contains: q, mode: 'insensitive' } },
          {
            translations: {
              some: {
                deletedAt: null,
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    return and.length ? { AND: and } : {};
  }

  async upsertTranslation(input: {
    listingId: string;
    language: LanguageCode;
    title: string;
    description: string;
    userId: string;
  }) {
    return this.prisma.listingTranslation.upsert({
      where: {
        listingId_language: {
          listingId: input.listingId,
          language: input.language,
        },
      },
      create: {
        listingId: input.listingId,
        language: input.language,
        title: input.title,
        description: input.description,
        createdById: input.userId,
        updatedById: input.userId,
      },
      update: {
        title: input.title,
        description: input.description,
        updatedById: input.userId,
        deletedAt: null,
      },
    });
  }
}
