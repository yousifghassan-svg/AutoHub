import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LanguageCode,
  ListingCategoryCode,
  ListingStatus,
  Prisma,
} from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import {
  canManageListing,
  canModerateListings,
} from '../domain/listing.policies';
import {
  canTransitionStatus,
  requiresModerationApproval,
} from '../domain/listing-status';
import { parseApiMediaType, toApiMediaType } from '../domain/media-type';
import {
  ListingRepository,
  type ListingWithRelations,
} from '../infrastructure/listing.repository';
import { ListingMediaRepository } from '../infrastructure/listing-media.repository';
import { ThumbnailService } from '../infrastructure/thumbnail.service';
import { uniqueSlug } from '../infrastructure/slug.util';
import { R2StorageService } from '../../../infrastructure/storage/r2-storage.service';
import { ListingValidationService } from './listing-validation.service';
import type { CreateListingInput } from './types/create-listing.input';
import type { UpdateListingInput } from './types/update-listing.input';
import type { SearchListingsInput } from './types/search-listings.input';
import type { AddMediaInput } from './types/add-media.input';

@Injectable()
export class ListingsService {
  constructor(
    private readonly listings: ListingRepository,
    private readonly media: ListingMediaRepository,
    private readonly validation: ListingValidationService,
    private readonly thumbnails: ThumbnailService,
    private readonly r2: R2StorageService,
  ) {}

  async create(actor: AuthenticatedUser, input: CreateListingInput) {
    const category = await this.validation.assertCategory(input.categoryId);
    const { city, country } = await this.validation.assertLocation(
      input.cityId,
      input.countryId,
    );
    this.validation.assertPrice(input.primaryPrice, input.secondaryPrice);

    if (input.primaryCurrencyId) {
      await this.validation.assertCurrency(input.primaryCurrencyId);
    }
    if (input.secondaryCurrencyId) {
      await this.validation.assertCurrency(input.secondaryCurrencyId);
    }

    await this.validation.assertBrandModel({
      categoryCode: category.code,
      brandId: input.carDetails?.brandId ?? input.vehicleDetails?.brandId,
      modelId: input.carDetails?.modelId ?? input.vehicleDetails?.modelId,
    });

    const title = input.title.trim();
    const slug = uniqueSlug(input.slug?.trim() || title);

    const listing = await this.listings.create({
      seller: { connect: { id: actor.id } },
      category: { connect: { id: category.id } },
      categoryCode: category.code,
      status: ListingStatus.DRAFT,
      country: { connect: { id: country.id } },
      city: { connect: { id: city.id } },
      conditionType: input.conditionTypeId
        ? { connect: { id: input.conditionTypeId } }
        : undefined,
      primaryPrice: input.primaryPrice,
      primaryCurrency: input.primaryCurrencyId
        ? { connect: { id: input.primaryCurrencyId } }
        : undefined,
      secondaryPrice: input.secondaryPrice,
      secondaryCurrency: input.secondaryCurrencyId
        ? { connect: { id: input.secondaryCurrencyId } }
        : undefined,
      slug,
      metaTitle: input.metaTitle ?? title,
      metaDescription: input.metaDescription,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
      translations: {
        create: {
          language: input.language ?? LanguageCode.ar,
          title,
          description: input.description,
          createdById: actor.id,
          updatedById: actor.id,
        },
      },
      ...(await this.buildDetailsCreate(category.code, input)),
    });

    return this.toResponse(listing);
  }

  async findById(id: string, actor?: AuthenticatedUser) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFoundException('Listing not found');

    if (!this.canView(listing, actor)) {
      throw new NotFoundException('Listing not found');
    }

    return this.toResponse(listing);
  }

  async search(query: SearchListingsInput, actor?: AuthenticatedUser) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const isStaff = actor ? canModerateListings(actor.role, actor.permissions) : false;
    const status = query.status;
    let statuses = query.statuses;
    const sellerId = query.mine ? actor?.id : query.sellerId;

    if (query.mine && !actor) {
      throw new ForbiddenException('Authentication required for mine=true');
    }

    const viewingOwn =
      Boolean(actor && sellerId && sellerId === actor.id);

    // Visibility enforced in SQL (not post-pagination) so totals stay correct.
    if (!isStaff && !viewingOwn) {
      if (!status && !statuses?.length) {
        statuses = [ListingStatus.ACTIVE];
      } else if (status && status !== ListingStatus.ACTIVE) {
        throw new ForbiddenException('Only ACTIVE listings are publicly searchable');
      } else if (statuses?.some((s) => s !== ListingStatus.ACTIVE)) {
        throw new ForbiddenException('Only ACTIVE listings are publicly searchable');
      }
    }

    const { items, total } = await this.listings.search({
      page,
      pageSize,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
      cityId: query.cityId,
      governorateId: query.governorateId,
      categoryId: query.categoryId,
      categoryCode: query.categoryCode,
      brandId: query.brandId,
      modelId: query.modelId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      status,
      statuses,
      isFeatured: query.isFeatured,
      keyword: query.keyword,
      sellerId,
    });

    return {
      items: items.map((item) => this.toResponse(item)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
    };
  }

  async update(id: string, actor: AuthenticatedUser, input: UpdateListingInput) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFoundException('Listing not found');
    this.assertCanManage(listing, actor);

    if (listing.status === ListingStatus.SOLD || listing.status === ListingStatus.ARCHIVED) {
      throw new BadRequestException(`Cannot edit listing in status ${listing.status}`);
    }

    if (input.cityId || input.countryId) {
      await this.validation.assertLocation(
        input.cityId ?? listing.cityId,
        input.countryId ?? listing.countryId,
      );
    }

    this.validation.assertPrice(
      input.primaryPrice ?? Number(listing.primaryPrice ?? 0),
      input.secondaryPrice ??
        (listing.secondaryPrice != null ? Number(listing.secondaryPrice) : null),
    );

    if (input.primaryCurrencyId) {
      await this.validation.assertCurrency(input.primaryCurrencyId);
    }
    if (input.secondaryCurrencyId) {
      await this.validation.assertCurrency(input.secondaryCurrencyId);
    }

    if (input.categoryId && input.categoryId !== listing.categoryId) {
      throw new BadRequestException('categoryId cannot be changed after creation');
    }

    await this.validation.assertBrandModel({
      categoryCode: listing.categoryCode,
      brandId: input.carDetails?.brandId ?? input.vehicleDetails?.brandId,
      modelId: input.carDetails?.modelId ?? input.vehicleDetails?.modelId,
    });

    const detailsUpdate = await this.buildDetailsUpdate(listing.categoryCode, input);
    const translationInput =
      input.title || input.description
        ? (() => {
            const existing =
              listing.translations.find(
                (t) => t.language === (input.language ?? LanguageCode.ar),
              ) ?? listing.translations[0];
            return {
              listingId: listing.id,
              language: input.language ?? existing?.language ?? LanguageCode.ar,
              title: input.title ?? existing?.title ?? listing.slug,
              description: input.description ?? existing?.description ?? '',
              userId: actor.id,
            };
          })()
        : undefined;

    const updated = await this.listings.updateWithTranslation(
      listing.id,
      {
        city: input.cityId ? { connect: { id: input.cityId } } : undefined,
        country: input.countryId ? { connect: { id: input.countryId } } : undefined,
        conditionType:
          input.conditionTypeId === null
            ? { disconnect: true }
            : input.conditionTypeId
              ? { connect: { id: input.conditionTypeId } }
              : undefined,
        primaryPrice: input.primaryPrice,
        primaryCurrency: input.primaryCurrencyId
          ? { connect: { id: input.primaryCurrencyId } }
          : undefined,
        secondaryPrice: input.secondaryPrice,
        secondaryCurrency: input.secondaryCurrencyId
          ? { connect: { id: input.secondaryCurrencyId } }
          : undefined,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        isFeatured: canModerateListings(actor.role, actor.permissions)
          ? input.isFeatured
          : undefined,
        updatedBy: { connect: { id: actor.id } },
        ...detailsUpdate,
      },
      translationInput,
    );

    return this.toResponse(updated);
  }

  async softDelete(id: string, actor: AuthenticatedUser) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFoundException('Listing not found');
    this.assertCanManage(listing, actor);
    const deleted = await this.listings.softDelete(listing.id, actor.id);
    return this.toResponse(deleted);
  }

  async changeStatus(
    id: string,
    actor: AuthenticatedUser,
    status: ListingStatus,
  ) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFoundException('Listing not found');

    if (!canTransitionStatus(listing.status, status)) {
      throw new BadRequestException(
        `Invalid status transition ${listing.status} → ${status}`,
      );
    }

    if (requiresModerationApproval(listing.status, status)) {
      if (!canModerateListings(actor.role, actor.permissions)) {
        throw new ForbiddenException('Only moderators/admins may approve PENDING → ACTIVE');
      }
    } else {
      this.assertCanManage(listing, actor);
    }

    // Owner submitting DRAFT → PENDING
    if (
      listing.status === ListingStatus.DRAFT &&
      status === ListingStatus.PENDING &&
      !canManageListing({
        actorId: actor.id,
        actorRole: actor.role,
        sellerId: listing.sellerId,
      })
    ) {
      throw new ForbiddenException('Not allowed to submit this listing');
    }

    const updated = await this.listings.update(listing.id, {
      status,
      publishedAt:
        status === ListingStatus.ACTIVE
          ? listing.publishedAt ?? new Date()
          : listing.publishedAt,
      soldAt: status === ListingStatus.SOLD ? new Date() : listing.soldAt,
      updatedBy: { connect: { id: actor.id } },
    });

    return this.toResponse(updated);
  }

  async addMedia(id: string, actor: AuthenticatedUser, input: AddMediaInput) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFoundException('Listing not found');
    this.assertCanManage(listing, actor);

    const mediaType = parseApiMediaType(input.mediaType);
    this.validation.assertMediaType(mediaType);

    if (!input.r2Key?.trim()) {
      throw new BadRequestException('r2Key is required');
    }

    const count = await this.media.countActive(listing.id);
    this.validation.assertMediaLimits(count);

    const sortOrder =
      input.sortOrder !== undefined
        ? input.sortOrder
        : await this.media.nextSortOrder(listing.id);

    const thumb = await this.thumbnails.generate({
      r2Key: input.r2Key.trim(),
      mediaType,
      sourceBuffer: input.sourceBuffer,
    });

    const created = await this.media.create({
      listing: { connect: { id: listing.id } },
      r2Key: input.r2Key.trim(),
      thumbnailKey: thumb.thumbnailKey,
      mediaType,
      mimeType: input.mimeType ?? thumb.mimeType,
      byteSize: input.byteSize ?? thumb.byteSize,
      width: thumb.width,
      height: thumb.height,
      sortOrder,
      confirmed: input.confirmed ?? true,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });

    return {
      id: created.id,
      listingId: created.listingId,
      r2Key: created.r2Key,
      thumbnailKey: created.thumbnailKey,
      mediaType: toApiMediaType(created.mediaType),
      mimeType: created.mimeType,
      byteSize: created.byteSize,
      width: created.width,
      height: created.height,
      sortOrder: created.sortOrder,
      confirmed: created.confirmed,
      createdAt: created.createdAt,
    };
  }

  async removeMedia(listingId: string, mediaId: string, actor: AuthenticatedUser) {
    const listing = await this.listings.findById(listingId);
    if (!listing) throw new NotFoundException('Listing not found');
    this.assertCanManage(listing, actor);

    const item = await this.media.findById(mediaId);
    if (!item || item.listingId !== listingId) {
      throw new NotFoundException('Media not found');
    }

    // Soft-delete DB first; R2 cleanup is best-effort so a storage blip
    // cannot leave an "active" row pointing at already-deleted objects.
    await this.media.softDelete(mediaId, actor.id);
    try {
      if (item.r2Key) await this.r2.deleteObject(item.r2Key);
      if (item.thumbnailKey) await this.r2.deleteObject(item.thumbnailKey);
    } catch {
      // Orphans are reaped by MediaCleanupService.
    }
    return { success: true as const };
  }

  private canView(
    listing: { status: ListingStatus; sellerId: string | null },
    actor?: AuthenticatedUser,
  ): boolean {
    if (listing.status === ListingStatus.ACTIVE) return true;
    if (!actor) return false;
    if (canModerateListings(actor.role, actor.permissions)) return true;
    return listing.sellerId === actor.id;
  }

  private assertCanManage(
    listing: { sellerId: string | null },
    actor: AuthenticatedUser,
  ) {
    if (
      !canManageListing({
        actorId: actor.id,
        actorRole: actor.role,
        sellerId: listing.sellerId,
      })
    ) {
      throw new ForbiddenException('You can only modify your own listings');
    }
  }

  private async buildDetailsCreate(
    categoryCode: ListingCategoryCode,
    input: CreateListingInput,
  ): Promise<Partial<Prisma.ListingCreateInput>> {
    const vehicle = input.carDetails ?? input.vehicleDetails;
    if (!vehicle) return {};

    if (categoryCode === ListingCategoryCode.CAR) {
      if (vehicle.year == null) {
        throw new BadRequestException('carDetails.year is required for CAR listings');
      }
      return {
        carDetails: {
          create: {
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
          },
        },
      };
    }

    if (categoryCode === ListingCategoryCode.MOTORCYCLE) {
      if (vehicle.year == null) {
        throw new BadRequestException('year is required for MOTORCYCLE listings');
      }
      return {
        motorcycleDetails: {
          create: {
            brandId: vehicle.brandId,
            modelId: vehicle.modelId,
            year: vehicle.year,
            mileageKm: vehicle.mileageKm,
            engineSizeCc: vehicle.engineSizeCc,
            fuelTypeId: vehicle.fuelTypeId,
            colorId: vehicle.colorId,
          },
        },
      };
    }

    if (categoryCode === ListingCategoryCode.TRUCK) {
      if (vehicle.year == null) {
        throw new BadRequestException('year is required for TRUCK listings');
      }
      return {
        truckDetails: {
          create: {
            brandId: vehicle.brandId,
            modelId: vehicle.modelId,
            year: vehicle.year,
            mileageKm: vehicle.mileageKm,
            fuelTypeId: vehicle.fuelTypeId,
            transmissionTypeId: vehicle.transmissionTypeId,
            colorId: vehicle.colorId,
          },
        },
      };
    }

    return {};
  }

  private async buildDetailsUpdate(
    categoryCode: ListingCategoryCode,
    input: UpdateListingInput,
  ): Promise<Partial<Prisma.ListingUpdateInput>> {
    const vehicle = input.carDetails ?? input.vehicleDetails;
    if (!vehicle) return {};

    const year = vehicle.year ?? new Date().getFullYear();
    const data = {
      brandId: vehicle.brandId,
      modelId: vehicle.modelId,
      mileageKm: vehicle.mileageKm,
      fuelTypeId: vehicle.fuelTypeId,
      transmissionTypeId: vehicle.transmissionTypeId,
      driveTypeId: vehicle.driveTypeId,
      bodyTypeId: vehicle.bodyTypeId,
      colorId: vehicle.colorId,
      engineTypeId: vehicle.engineTypeId,
      engineSizeCc: vehicle.engineSizeCc,
      doors: vehicle.doors,
    };

    if (categoryCode === ListingCategoryCode.CAR) {
      return {
        carDetails: {
          upsert: {
            create: {
              ...data,
              year,
            },
            update: {
              ...data,
              year: vehicle.year,
            },
          },
        },
      };
    }

    if (categoryCode === ListingCategoryCode.MOTORCYCLE) {
      return {
        motorcycleDetails: {
          upsert: {
            create: {
              year,
              brandId: vehicle.brandId,
              modelId: vehicle.modelId,
              mileageKm: vehicle.mileageKm,
              engineSizeCc: vehicle.engineSizeCc,
              fuelTypeId: vehicle.fuelTypeId,
              colorId: vehicle.colorId,
            },
            update: {
              brandId: vehicle.brandId,
              modelId: vehicle.modelId,
              year: vehicle.year,
              mileageKm: vehicle.mileageKm,
              engineSizeCc: vehicle.engineSizeCc,
              fuelTypeId: vehicle.fuelTypeId,
              colorId: vehicle.colorId,
            },
          },
        },
      };
    }

    if (categoryCode === ListingCategoryCode.TRUCK) {
      return {
        truckDetails: {
          upsert: {
            create: {
              year,
              brandId: vehicle.brandId,
              modelId: vehicle.modelId,
              mileageKm: vehicle.mileageKm,
              fuelTypeId: vehicle.fuelTypeId,
              transmissionTypeId: vehicle.transmissionTypeId,
              colorId: vehicle.colorId,
            },
            update: {
              brandId: vehicle.brandId,
              modelId: vehicle.modelId,
              year: vehicle.year,
              mileageKm: vehicle.mileageKm,
              fuelTypeId: vehicle.fuelTypeId,
              transmissionTypeId: vehicle.transmissionTypeId,
              colorId: vehicle.colorId,
            },
          },
        },
      };
    }

    return {};
  }

  private toResponse(listing: ListingWithRelations) {
    return {
      id: listing.id,
      sellerId: listing.sellerId,
      categoryId: listing.categoryId,
      categoryCode: listing.categoryCode,
      status: listing.status,
      countryId: listing.countryId,
      cityId: listing.cityId,
      governorateId: listing.city.governorateId,
      conditionTypeId: listing.conditionTypeId,
      primaryPrice: listing.primaryPrice != null ? Number(listing.primaryPrice) : null,
      primaryCurrencyId: listing.primaryCurrencyId,
      secondaryPrice:
        listing.secondaryPrice != null ? Number(listing.secondaryPrice) : null,
      secondaryCurrencyId: listing.secondaryCurrencyId,
      slug: listing.slug,
      metaTitle: listing.metaTitle,
      metaDescription: listing.metaDescription,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      verificationStatus: listing.verificationStatus,
      viewsCount: listing.viewsCount,
      favoritesCount: listing.favoritesCount,
      publishedAt: listing.publishedAt,
      soldAt: listing.soldAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      translations: listing.translations.map((t) => ({
        language: t.language,
        title: t.title,
        description: t.description,
      })),
      media: listing.media.map((m) => ({
        id: m.id,
        r2Key: m.r2Key,
        thumbnailKey: m.thumbnailKey,
        mediaType: toApiMediaType(m.mediaType),
        mimeType: m.mimeType,
        sortOrder: m.sortOrder,
        confirmed: m.confirmed,
      })),
      carDetails: listing.carDetails,
      motorcycleDetails: listing.motorcycleDetails,
      truckDetails: listing.truckDetails,
      heavyEquipmentDetails: listing.heavyEquipmentDetails,
      plateDetails: listing.plateDetails,
      category: {
        id: listing.category.id,
        code: listing.category.code,
        slug: listing.category.slug,
        nameEn: listing.category.nameEn,
        nameAr: listing.category.nameAr,
      },
      city: {
        id: listing.city.id,
        slug: listing.city.slug,
        nameEn: listing.city.nameEn,
        nameAr: listing.city.nameAr,
        governorateId: listing.city.governorateId,
      },
    };
  }
}
