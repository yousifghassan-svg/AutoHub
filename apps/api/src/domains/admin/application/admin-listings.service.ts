import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LanguageCode,
  ListingCategoryCode,
  ListingStatus,
  MarketplaceDomain,
  Prisma,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { canTransitionStatus } from '../../listings/domain/listing-status';
import { uniqueSlug } from '../../listings/infrastructure/slug.util';
import type {
  PlateDetailsInput,
  VehicleDetailsInput,
} from '../../listings/application/types/create-listing.input';
import { NotificationsService } from '../../notifications/application/notifications.service';
import { AdminAuditService } from './admin-audit.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';

export type AdminListingsQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  cityId?: string;
  brandId?: string;
  modelId?: string;
  status?: ListingStatus;
  sellerId?: string;
  dealerId?: string;
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  year?: number;
  plate?: string;
  categoryCode?: ListingCategoryCode;
  domain?: MarketplaceDomain;
  includeDeleted?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'primaryPrice' | 'viewsCount';
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
};

export type AdminCreateListingData = {
  title: string;
  description: string;
  categoryId: string;
  cityId: string;
  countryId?: string;
  sellerId?: string;
  conditionTypeId?: string;
  primaryPrice?: number;
  currencyCode?: string;
  primaryCurrencyId?: string;
  status?: ListingStatus;
  isFeatured?: boolean;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  carDetails?: VehicleDetailsInput;
  plateDetails?: Partial<PlateDetailsInput>;
  language?: LanguageCode;
};

export type AdminUpdateListingData = {
  title?: string;
  description?: string;
  primaryPrice?: number;
  secondaryPrice?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  cityId?: string;
  sellerId?: string;
  conditionTypeId?: string;
  currencyCode?: string;
  primaryCurrencyId?: string;
  categoryId?: string;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  carDetails?: VehicleDetailsInput;
  plateDetails?: Partial<PlateDetailsInput>;
};

type BulkAction =
  | 'delete'
  | 'archive'
  | 'activate'
  | 'deactivate'
  | 'feature'
  | 'unfeature'
  | 'restore';

@Injectable()
export class AdminListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(query: AdminListingsQuery) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where = await this.buildWhere(query);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const [total, items] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: this.include(),
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
    };
  }

  async findById(id: string, options?: { includeDeleted?: boolean }) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id,
        ...(options?.includeDeleted ? {} : { deletedAt: null }),
      },
      include: this.include(),
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async create(
    actor: AuthenticatedUser,
    dto: AdminCreateListingData,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const category = await this.assertCategory(dto.categoryId);
    const { city, country } = await this.assertLocation(dto.cityId, dto.countryId);

    const primaryCurrency = await this.resolveCurrency({
      currencyCode: dto.currencyCode,
      primaryCurrencyId: dto.primaryCurrencyId,
    });
    if (dto.sellerId) {
      await this.assertSeller(dto.sellerId);
    }
    if (dto.conditionTypeId) {
      await this.assertConditionType(dto.conditionTypeId);
    }

    if (category.code === ListingCategoryCode.CAR) {
      if (dto.carDetails?.year == null) {
        throw new BadRequestException('carDetails.year is required for CAR listings');
      }
    }

    const title = dto.title.trim();
    const slug = uniqueSlug(title);
    const sellerId = dto.sellerId ?? actor.id;
    const status = dto.status ?? ListingStatus.DRAFT;

    const listing = await this.prisma.listing.create({
      data: {
        seller: { connect: { id: sellerId } },
        category: { connect: { id: category.id } },
        categoryCode: category.code,
        domain:
          category.code === ListingCategoryCode.PLATE
            ? MarketplaceDomain.PLATE
            : MarketplaceDomain.VEHICLE,
        status,
        country: { connect: { id: country.id } },
        city: { connect: { id: city.id } },
        conditionType: dto.conditionTypeId
          ? { connect: { id: dto.conditionTypeId } }
          : undefined,
        primaryPrice: dto.primaryPrice,
        primaryCurrency: { connect: { id: primaryCurrency.id } },
        slug,
        metaTitle: title,
        isFeatured: dto.isFeatured ?? false,
        locationText: dto.locationText?.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        publishedAt: status === ListingStatus.ACTIVE ? new Date() : undefined,
        createdBy: { connect: { id: actor.id } },
        updatedBy: { connect: { id: actor.id } },
        translations: {
          create: {
            language: dto.language ?? LanguageCode.ar,
            title,
            description: dto.description,
            createdById: actor.id,
            updatedById: actor.id,
          },
        },
        ...(await this.buildDetailsCreate(category.code, dto)),
      },
      include: this.include(),
    });

    await this.audit.log({
      actorId: actor.id,
      action: 'listing.create',
      module: 'listings',
      entityId: listing.id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      after: listing,
    });

    return listing;
  }

  async update(
    id: string,
    data: AdminUpdateListingData,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);

    let categoryCode: ListingCategoryCode | undefined;
    if (data.categoryId && data.categoryId !== before.categoryId) {
      const category = await this.assertCategory(data.categoryId);
      categoryCode = category.code;
    }
    if (data.sellerId) await this.assertSeller(data.sellerId);
    if (data.conditionTypeId) await this.assertConditionType(data.conditionTypeId);
    let primaryCurrencyId: string | undefined;
    if (data.currencyCode || data.primaryCurrencyId) {
      const currency = await this.resolveCurrency({
        currencyCode: data.currencyCode,
        primaryCurrencyId: data.primaryCurrencyId,
      });
      primaryCurrencyId = currency.id;
    }
    if (data.cityId) await this.assertCity(data.cityId);

    const translation = before.translations[0];
    const detailsUpdate = await this.buildDetailsUpdate(
      categoryCode ?? before.categoryCode,
      data,
    );

    const listingData: Prisma.ListingUpdateInput = {
      ...detailsUpdate,
      primaryPrice: data.primaryPrice,
      secondaryPrice: data.secondaryPrice,
      isFeatured: data.isFeatured,
      isVerified: data.isVerified,
      categoryCode,
      locationText: data.locationText?.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      updatedBy: { connect: { id: actor.id } },
      seller: data.sellerId ? { connect: { id: data.sellerId } } : undefined,
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      conditionType: data.conditionTypeId
        ? { connect: { id: data.conditionTypeId } }
        : undefined,
      primaryCurrency: primaryCurrencyId
        ? { connect: { id: primaryCurrencyId } }
        : undefined,
      city: data.cityId ? { connect: { id: data.cityId } } : undefined,
    };

    const updated = await this.prisma.$transaction(async (tx) => {
      if ((data.title || data.description) && translation) {
        await tx.listingTranslation.update({
          where: {
            listingId_language: {
              listingId: id,
              language: translation.language,
            },
          },
          data: {
            title: data.title ?? translation.title,
            description: data.description ?? translation.description,
            updatedById: actor.id,
          },
        });
      }

      return tx.listing.update({
        where: { id },
        data: listingData,
        include: this.include(),
      });
    });

    await this.audit.log({
      actorId: actor.id,
      action: 'listing.update',
      module: 'listings',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });

    return updated;
  }

  async softDelete(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    const updated = await this.prisma.listing.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: actor.id },
      include: this.include(),
    });
    await this.audit.log({
      actorId: actor.id,
      action: 'listing.delete',
      module: 'listings',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }

  async restore(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id, { includeDeleted: true });
    if (!before.deletedAt) {
      throw new BadRequestException('Listing is not deleted');
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { deletedAt: null, updatedById: actor.id },
      include: this.include(),
    });

    await this.audit.log({
      actorId: actor.id,
      action: 'listing.restore',
      module: 'listings',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }

  async permanentDelete(
    id: string,
    actor: AuthenticatedUser,
    options?: { force?: boolean; ip?: string; userAgent?: string },
  ) {
    const listing = await this.prisma.listing.findFirst({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (!listing.deletedAt && !options?.force) {
      throw new BadRequestException(
        'Listing must be soft-deleted before permanent delete (or pass force=true)',
      );
    }

    await this.prisma.listing.delete({ where: { id } });

    await this.audit.log({
      actorId: actor.id,
      action: 'listing.permanent_delete',
      module: 'listings',
      entityId: id,
      ip: options?.ip,
      userAgent: options?.userAgent,
      before: listing,
    });

    return { id, deleted: true };
  }

  async bulk(
    ids: string[],
    action: BulkAction,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const results: unknown[] = [];
    for (const id of ids) {
      switch (action) {
        case 'delete':
          results.push(await this.softDelete(id, actor, ctx));
          break;
        case 'archive':
          results.push(await this.archive(id, actor, ctx));
          break;
        case 'activate':
          results.push(await this.approve(id, actor, ctx));
          break;
        case 'deactivate':
          results.push(await this.archive(id, actor, ctx));
          break;
        case 'feature':
          results.push(await this.feature(id, actor, ctx));
          break;
        case 'unfeature':
          results.push(await this.unfeature(id, actor, ctx));
          break;
        case 'restore':
          results.push(await this.restore(id, actor, ctx));
          break;
      }
    }
    return { action, count: results.length, items: results };
  }

  async exportCsv(query: AdminListingsQuery): Promise<string> {
    const where = await this.buildWhere(query);
    const items = await this.prisma.listing.findMany({
      where,
      include: {
        translations: { take: 1 },
        city: true,
        seller: { select: { id: true, displayName: true } },
        carDetails: { include: { brand: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10_000,
    });

    const header = [
      'id',
      'title',
      'status',
      'price',
      'city',
      'seller',
      'year',
      'brand',
      'featured',
      'views',
      'favorites',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ];

    const rows = items.map((item) => [
      item.id,
      item.translations[0]?.title ?? '',
      item.status,
      item.primaryPrice?.toString() ?? '',
      item.city?.nameEn ?? '',
      item.seller?.displayName ?? '',
      item.carDetails?.year?.toString() ?? '',
      item.carDetails?.brand?.nameEn ?? '',
      item.isFeatured ? 'true' : 'false',
      item.viewsCount.toString(),
      item.favoritesCount.toString(),
      item.createdAt.toISOString(),
      item.updatedAt.toISOString(),
      item.deletedAt?.toISOString() ?? '',
    ]);

    return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
  }

  async approve(id: string, actor: AuthenticatedUser, ctx?: { ip?: string; userAgent?: string }) {
    return this.transition(id, ListingStatus.ACTIVE, actor, 'listing.approve', ctx);
  }

  /** Alias for approve — publish to marketplace. */
  async publish(id: string, actor: AuthenticatedUser, ctx?: { ip?: string; userAgent?: string }) {
    return this.transition(id, ListingStatus.ACTIVE, actor, 'listing.publish', ctx);
  }

  /** Unpublish = archive (remove from marketplace). */
  async unpublish(id: string, actor: AuthenticatedUser, ctx?: { ip?: string; userAgent?: string }) {
    return this.transition(id, ListingStatus.ARCHIVED, actor, 'listing.unpublish', ctx);
  }

  async reject(id: string, actor: AuthenticatedUser, ctx?: { ip?: string; userAgent?: string }) {
    return this.transition(id, ListingStatus.REJECTED, actor, 'listing.reject', ctx);
  }

  async archive(id: string, actor: AuthenticatedUser, ctx?: { ip?: string; userAgent?: string }) {
    return this.transition(id, ListingStatus.ARCHIVED, actor, 'listing.archive', ctx);
  }

  async duplicate(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const source = await this.findById(id);
    const title =
      `${source.translations[0]?.title ?? source.slug} (copy)`.trim();
    const description = source.translations[0]?.description ?? '';
    const slug = uniqueSlug(title);

    const created = await this.prisma.listing.create({
      data: {
        seller: source.sellerId ? { connect: { id: source.sellerId } } : undefined,
        category: { connect: { id: source.categoryId } },
        categoryCode: source.categoryCode,
        status: ListingStatus.DRAFT,
        country: { connect: { id: source.countryId } },
        city: { connect: { id: source.cityId } },
        conditionType: source.conditionTypeId
          ? { connect: { id: source.conditionTypeId } }
          : undefined,
        primaryPrice: source.primaryPrice ?? undefined,
        primaryCurrency: source.primaryCurrencyId
          ? { connect: { id: source.primaryCurrencyId } }
          : undefined,
        secondaryPrice: source.secondaryPrice ?? undefined,
        secondaryCurrency: source.secondaryCurrencyId
          ? { connect: { id: source.secondaryCurrencyId } }
          : undefined,
        slug,
        metaTitle: title,
        isFeatured: false,
        isVerified: false,
        locationText: source.locationText ?? undefined,
        latitude: source.latitude ?? undefined,
        longitude: source.longitude ?? undefined,
        features: source.features ?? [],
        createdBy: { connect: { id: actor.id } },
        updatedBy: { connect: { id: actor.id } },
        translations: {
          create: {
            language: source.translations[0]?.language ?? LanguageCode.ar,
            title,
            description,
            createdById: actor.id,
            updatedById: actor.id,
          },
        },
        ...(source.carDetails
          ? {
              carDetails: {
                create: {
                  brandId: source.carDetails.brandId,
                  modelId: source.carDetails.modelId,
                  year: source.carDetails.year,
                  mileageKm: source.carDetails.mileageKm,
                  fuelTypeId: source.carDetails.fuelTypeId,
                  transmissionTypeId: source.carDetails.transmissionTypeId,
                  driveTypeId: source.carDetails.driveTypeId,
                  bodyTypeId: source.carDetails.bodyTypeId,
                  colorId: source.carDetails.colorId,
                  engineTypeId: source.carDetails.engineTypeId,
                  engineSizeCc: source.carDetails.engineSizeCc,
                  doors: source.carDetails.doors,
                  vin: source.carDetails.vin,
                  trim: source.carDetails.trim,
                  seats: source.carDetails.seats,
                  interiorColor: source.carDetails.interiorColor,
                },
              },
            }
          : {}),
        ...(source.plateDetails
          ? {
              plateDetails: {
                create: {
                  formatCode: source.plateDetails.formatCode,
                  plateDisplay: source.plateDetails.plateDisplay,
                  plateNormalized: source.plateDetails.plateNormalized,
                  series: source.plateDetails.series,
                  number: source.plateDetails.number,
                  regionCode: source.plateDetails.regionCode,
                  plateType: source.plateDetails.plateType,
                },
              },
            }
          : {}),
      },
      include: this.include(),
    });

    await this.audit.log({
      actorId: actor.id,
      action: 'listing.duplicate',
      module: 'listings',
      entityId: created.id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before: { sourceId: source.id },
      after: created,
    });

    return created;
  }

  async feature(id: string, actor: AuthenticatedUser, ctx?: { ip?: string; userAgent?: string }) {
    return this.setFeatured(id, true, actor, ctx);
  }

  async unfeature(id: string, actor: AuthenticatedUser, ctx?: { ip?: string; userAgent?: string }) {
    return this.setFeatured(id, false, actor, ctx);
  }

  private async setFeatured(
    id: string,
    isFeatured: boolean,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (isFeatured && settings) {
      const featuredCount = await this.prisma.listing.count({
        where: { deletedAt: null, isFeatured: true },
      });
      if (!before.isFeatured && featuredCount >= settings.featuredLimit) {
        throw new BadRequestException(
          `Featured limit reached (${settings.featuredLimit})`,
        );
      }
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        isFeatured,
        featuredUntil: isFeatured
          ? new Date(Date.now() + 30 * 86_400_000)
          : null,
        updatedById: actor.id,
      },
      include: this.include(),
    });

    await this.audit.log({
      actorId: actor.id,
      action: isFeatured ? 'listing.feature' : 'listing.unfeature',
      module: 'listings',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }

  private async transition(
    id: string,
    to: ListingStatus,
    actor: AuthenticatedUser,
    action: string,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    if (!canTransitionStatus(before.status, to) && before.status !== to) {
      if (!(to === ListingStatus.ARCHIVED && before.status !== ListingStatus.ARCHIVED)) {
        throw new BadRequestException(
          `Cannot transition from ${before.status} to ${to}`,
        );
      }
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        status: to,
        updatedById: actor.id,
        publishedAt:
          to === ListingStatus.ACTIVE
            ? (before.publishedAt ?? new Date())
            : before.publishedAt,
        soldAt: to === ListingStatus.SOLD ? (before.soldAt ?? new Date()) : before.soldAt,
      },
      include: this.include(),
    });

    await this.audit.log({
      actorId: actor.id,
      action,
      module: 'listings',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });

    // Same seller notify path as ListingsService.changeStatus (PENDING → ACTIVE/REJECTED).
    if (
      before.status === ListingStatus.PENDING &&
      (to === ListingStatus.ACTIVE || to === ListingStatus.REJECTED) &&
      before.sellerId
    ) {
      await this.notifications.notifyListingStatus(before.sellerId, id, to);
    }

    return updated;
  }

  private carDetailsData(vehicle: VehicleDetailsInput) {
    return {
      brandId: vehicle.brandId,
      modelId: vehicle.modelId,
      year: vehicle.year,
      mileageKm: vehicle.mileageKm,
      fuelTypeId: vehicle.fuelTypeId,
      transmissionTypeId: vehicle.transmissionTypeId,
      driveTypeId: vehicle.driveTypeId,
      bodyTypeId: vehicle.bodyTypeId,
      colorId: vehicle.colorId,
      engineTypeId: vehicle.engineTypeId,
      engineSizeCc: vehicle.engineSizeCc,
      doors: vehicle.doors,
      vin: vehicle.vin?.trim(),
      trim: vehicle.trim?.trim(),
      seats: vehicle.seats,
      interiorColor: vehicle.interiorColor?.trim(),
    };
  }

  private plateDetailsData(plate: Partial<PlateDetailsInput>) {
    if (!plate.formatCode?.trim() || !plate.plateDisplay?.trim()) {
      throw new BadRequestException('plateDetails.formatCode and plateDisplay are required');
    }
    const plateDisplay = plate.plateDisplay.trim();
    const plateNormalized =
      plate.plateNormalized?.trim().toUpperCase() ||
      plateDisplay.replace(/\s+/g, '').toUpperCase();
    return {
      formatCode: plate.formatCode.trim(),
      plateDisplay,
      plateNormalized,
      series: plate.series?.trim(),
      number: plate.number?.trim(),
      regionCode: plate.regionCode?.trim(),
      plateType: plate.plateType?.trim(),
    };
  }

  private async buildDetailsCreate(
    categoryCode: ListingCategoryCode,
    input: AdminCreateListingData,
  ): Promise<Partial<Prisma.ListingCreateInput>> {
    const result: Partial<Prisma.ListingCreateInput> = {};

    if (input.plateDetails) {
      result.plateDetails = {
        create: this.plateDetailsData(input.plateDetails),
      };
    }

    const vehicle = input.carDetails;
    if (!vehicle) return result;

    if (categoryCode === ListingCategoryCode.CAR && vehicle.year != null) {
      result.carDetails = {
        create: {
          ...this.carDetailsData(vehicle),
          year: vehicle.year,
        },
      };
    }

    return result;
  }

  private async buildDetailsUpdate(
    categoryCode: ListingCategoryCode,
    input: AdminUpdateListingData,
  ): Promise<Partial<Prisma.ListingUpdateInput>> {
    const result: Partial<Prisma.ListingUpdateInput> = {};

    if (input.plateDetails) {
      const data = this.plateDetailsData(input.plateDetails);
      result.plateDetails = {
        upsert: {
          create: data,
          update: data,
        },
      };
    }

    const vehicle = input.carDetails;
    if (!vehicle) return result;

    const year = vehicle.year ?? new Date().getFullYear();
    const data = this.carDetailsData(vehicle);

    if (categoryCode === ListingCategoryCode.CAR) {
      result.carDetails = {
        upsert: {
          create: { ...data, year },
          update: { ...data, ...(vehicle.year != null ? { year: vehicle.year } : {}) },
        },
      };
    }

    return result;
  }

  private async buildWhere(query: AdminListingsQuery): Promise<Prisma.ListingWhereInput> {
    const and: Prisma.ListingWhereInput[] = [];
    if (!query.includeDeleted) and.push({ deletedAt: null });

    if (query.status) and.push({ status: query.status });
    if (query.cityId) and.push({ cityId: query.cityId });
    if (query.sellerId) and.push({ sellerId: query.sellerId });
    if (query.categoryCode) and.push({ categoryCode: query.categoryCode });
    if (query.domain) and.push({ domain: query.domain });
    if (query.featured != null) and.push({ isFeatured: query.featured });
    if (query.currencyCode) {
      and.push({
        primaryCurrency: { code: query.currencyCode.toUpperCase() },
      });
    } else if (query.minPrice != null || query.maxPrice != null) {
      and.push({ primaryCurrency: { code: 'IQD' } });
    }
    if (query.minPrice != null || query.maxPrice != null) {
      and.push({
        primaryPrice: {
          gte: query.minPrice,
          lte: query.maxPrice,
        },
      });
    }
    if (query.brandId || query.modelId || query.year != null) {
      and.push({
        carDetails: {
          is: {
            brandId: query.brandId,
            modelId: query.modelId,
            year: query.year,
          },
        },
      });
    }
    if (query.plate) {
      const term = query.plate.trim();
      and.push({
        plateDetails: {
          is: {
            OR: [
              { plateDisplay: { contains: term, mode: 'insensitive' } },
              { plateNormalized: { contains: term.replace(/\s+/g, '').toUpperCase() } },
              { regionCode: { contains: term, mode: 'insensitive' } },
              { series: { contains: term, mode: 'insensitive' } },
              { number: { contains: term } },
            ],
          },
        },
      });
    }
    if (query.dealerId) {
      const members = await this.prisma.dealerMember.findMany({
        where: { organizationId: query.dealerId, deletedAt: null },
        select: { userId: true },
      });
      and.push({ sellerId: { in: members.map((m) => m.userId) } });
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { slug: { contains: q, mode: 'insensitive' } },
          { metaTitle: { contains: q, mode: 'insensitive' } },
          {
            translations: {
              some: {
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

  private include() {
    return {
      translations: true,
      media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' as const } },
      city: { include: { governorate: true } },
      category: true,
      seller: {
        select: { id: true, displayName: true, phone: true, email: true, role: true },
      },
      conditionType: true,
      primaryCurrency: true,
      carDetails: {
        include: {
          brand: true,
          model: true,
          fuelType: true,
          transmissionType: true,
          driveType: true,
          bodyType: true,
          color: true,
          engineType: true,
        },
      },
      motorcycleDetails: true,
      truckDetails: true,
      plateDetails: true,
    };
  }

  private async assertCategory(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, active: true, deletedAt: null },
    });
    if (!category) throw new BadRequestException('Invalid or inactive category');
    return category;
  }

  private async assertCity(cityId: string) {
    const city = await this.prisma.city.findFirst({
      where: { id: cityId, active: true, deletedAt: null },
    });
    if (!city) throw new BadRequestException('Invalid or inactive city');
    return city;
  }

  private async assertLocation(cityId: string, countryId?: string) {
    const city = await this.prisma.city.findFirst({
      where: { id: cityId, active: true, deletedAt: null },
      include: { governorate: true },
    });
    if (!city) throw new BadRequestException('Invalid or inactive city');

    const resolvedCountryId = countryId ?? city.governorate.countryId;
    const country = await this.prisma.country.findFirst({
      where: { id: resolvedCountryId, active: true, deletedAt: null },
    });
    if (!country) throw new BadRequestException('Invalid or inactive country');

    if (city.governorate.countryId !== country.id) {
      throw new BadRequestException('City does not belong to the provided country');
    }

    return { city, country, governorate: city.governorate };
  }

  private async assertCurrency(currencyId: string) {
    const currency = await this.prisma.currency.findFirst({
      where: { id: currencyId, active: true, deletedAt: null },
    });
    if (!currency) throw new BadRequestException('Invalid or inactive currency');
    return currency;
  }

  private async resolveCurrency(input: {
    currencyCode?: string | null;
    primaryCurrencyId?: string | null;
  }) {
    if (input.currencyCode?.trim()) {
      const byCode = await this.prisma.currency.findFirst({
        where: {
          code: input.currencyCode.trim().toUpperCase(),
          active: true,
          deletedAt: null,
        },
      });
      if (!byCode) {
        throw new BadRequestException(
          `Invalid or inactive currency: ${input.currencyCode}`,
        );
      }
      return byCode;
    }
    if (input.primaryCurrencyId?.trim()) {
      return this.assertCurrency(input.primaryCurrencyId);
    }
    const fallback = await this.prisma.currency.findFirst({
      where: { isDefault: true, active: true, deletedAt: null },
    });
    if (fallback) return fallback;
    return this.prisma.currency.findFirstOrThrow({
      where: { code: 'IQD', active: true, deletedAt: null },
    });
  }

  private async assertSeller(sellerId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: sellerId, deletedAt: null },
    });
    if (!user) throw new BadRequestException('Invalid seller');
    return user;
  }

  private async assertConditionType(conditionTypeId: string) {
    const condition = await this.prisma.conditionType.findFirst({
      where: { id: conditionTypeId, active: true, deletedAt: null },
    });
    if (!condition) throw new BadRequestException('Invalid or inactive condition type');
    return condition;
  }
}

function csvCell(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
