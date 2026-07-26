import { Injectable } from '@nestjs/common';
import {
  LanguageCode,
  ListingCategoryCode,
  ListingStatus,
  Prisma,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { VEHICLE_DOMAIN } from '../domain/vehicle.constants';

export type VehicleListParams = {
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
  currencyCode?: string;
  status?: ListingStatus;
  statuses?: ListingStatus[];
  isFeatured?: boolean;
  keyword?: string;
  sellerId?: string;
  includeDeleted?: boolean;
};

export type VehicleSearchParams = VehicleListParams & {
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelTypeId?: string;
  transmissionTypeId?: string;
  bodyTypeId?: string;
  driveTypeId?: string;
  colorId?: string;
};

const vehicleInclude = {
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

export type VehicleWithRelations = Prisma.ListingGetPayload<{
  include: typeof vehicleInclude;
}>;

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  get client() {
    return this.prisma;
  }

  findById(id: string): Promise<VehicleWithRelations | null> {
    return this.prisma.listing.findFirst({
      where: { id, deletedAt: null, domain: VEHICLE_DOMAIN },
      include: vehicleInclude,
    });
  }

  async list(params: VehicleListParams): Promise<{
    items: VehicleWithRelations[];
    total: number;
  }> {
    const where = this.buildListWhere(params);
    const skip = (params.page - 1) * params.pageSize;

    const listInclude = {
      ...vehicleInclude,
      translations: { where: { deletedAt: null }, take: 2 },
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

    return { items: items as VehicleWithRelations[], total };
  }

  async search(params: VehicleSearchParams): Promise<{
    items: VehicleWithRelations[];
    total: number;
  }> {
    const where = this.buildSearchWhere(params);
    const skip = (params.page - 1) * params.pageSize;

    const listInclude = {
      ...vehicleInclude,
      translations: { where: { deletedAt: null }, take: 2 },
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

    return { items: items as VehicleWithRelations[], total };
  }

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
  ): Promise<VehicleWithRelations> {
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
        where: { id, domain: VEHICLE_DOMAIN },
        data,
        include: vehicleInclude,
      });
    });
  }

  private buildListWhere(params: VehicleListParams): Prisma.ListingWhereInput {
    const and: Prisma.ListingWhereInput[] = [{ domain: VEHICLE_DOMAIN }];

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

    this.applyCurrencyAwarePriceFilter(and, params);

    if (params.brandId || params.modelId) {
      and.push(this.buildMakeModelFilter(params.brandId, params.modelId));
    }

    if (params.keyword?.trim()) {
      and.push(this.buildKeywordFilter(params.keyword.trim()));
    }

    return { AND: and };
  }

  private buildSearchWhere(params: VehicleSearchParams): Prisma.ListingWhereInput {
    const and: Prisma.ListingWhereInput[] = [{ domain: VEHICLE_DOMAIN }];

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

    this.applyCurrencyAwarePriceFilter(and, params);

    const vehicleFilter = this.buildVehicleDimensionFilter(params);
    if (vehicleFilter) and.push(vehicleFilter);

    if (params.keyword?.trim()) {
      and.push(this.buildKeywordFilter(params.keyword.trim()));
    }

    return { AND: and };
  }

  private applyCurrencyAwarePriceFilter(
    and: Prisma.ListingWhereInput[],
    params: Pick<VehicleListParams, 'minPrice' | 'maxPrice' | 'currencyCode' | 'sortBy'>,
  ) {
    const hasPriceFilter =
      params.minPrice !== undefined || params.maxPrice !== undefined;
    const hasPriceSort = params.sortBy === 'primaryPrice';
    if (params.currencyCode) {
      and.push({
        primaryCurrency: { code: params.currencyCode.toUpperCase() },
      });
    } else if (hasPriceFilter || hasPriceSort) {
      and.push({ primaryCurrency: { code: 'IQD' } });
    }
    if (hasPriceFilter) {
      and.push({
        primaryPrice: {
          gte: params.minPrice !== undefined ? params.minPrice : undefined,
          lte: params.maxPrice !== undefined ? params.maxPrice : undefined,
        },
      });
    }
  }

  private buildMakeModelFilter(
    brandId?: string,
    modelId?: string,
  ): Prisma.ListingWhereInput {
    return {
      OR: [
        {
          carDetails: {
            is: { brandId, modelId, deletedAt: null },
          },
        },
        {
          motorcycleDetails: {
            is: { brandId, modelId, deletedAt: null },
          },
        },
        {
          truckDetails: {
            is: { brandId, modelId, deletedAt: null },
          },
        },
      ],
    };
  }

  private buildVehicleDimensionFilter(
    params: VehicleSearchParams,
  ): Prisma.ListingWhereInput | undefined {
    const hasDims =
      params.brandId ||
      params.modelId ||
      params.minYear !== undefined ||
      params.maxYear !== undefined ||
      params.minMileage !== undefined ||
      params.maxMileage !== undefined ||
      params.fuelTypeId ||
      params.transmissionTypeId ||
      params.bodyTypeId ||
      params.driveTypeId ||
      params.colorId;

    if (!hasDims) return undefined;

    const year =
      params.minYear !== undefined || params.maxYear !== undefined
        ? { gte: params.minYear, lte: params.maxYear }
        : undefined;
    const mileageKm =
      params.minMileage !== undefined || params.maxMileage !== undefined
        ? { gte: params.minMileage, lte: params.maxMileage }
        : undefined;

    const shared = {
      brandId: params.brandId,
      modelId: params.modelId,
      year,
      mileageKm,
      fuelTypeId: params.fuelTypeId,
      deletedAt: null as null,
    };

    return {
      OR: [
        {
          carDetails: {
            is: {
              ...shared,
              transmissionTypeId: params.transmissionTypeId,
              bodyTypeId: params.bodyTypeId,
              colorId: params.colorId,
              driveTypeId: params.driveTypeId,
            },
          },
        },
        {
          motorcycleDetails: {
            is: {
              brandId: params.brandId,
              modelId: params.modelId,
              year,
              mileageKm,
              fuelTypeId: params.fuelTypeId,
              colorId: params.colorId,
              deletedAt: null,
            },
          },
        },
        {
          truckDetails: {
            is: {
              brandId: params.brandId,
              modelId: params.modelId,
              year,
              mileageKm,
              fuelTypeId: params.fuelTypeId,
              transmissionTypeId: params.transmissionTypeId,
              colorId: params.colorId,
              deletedAt: null,
            },
          },
        },
      ],
    };
  }

  private buildKeywordFilter(q: string): Prisma.ListingWhereInput {
    return {
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
    };
  }
}
