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
  MarketplaceDomain,
  MediaAssetStatus,
  MediaType,
  MediaVariantKind,
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
import { MediaAssetRepository } from '../../media/infrastructure/media-asset.repository';
import { DOCUMENT_PURPOSES } from '../../media/domain/media.policies';
import { ListingValidationService } from './listing-validation.service';
import { NotificationsService } from '../../notifications/application/notifications.service';
import { CurrenciesService } from '../../currencies/application/currencies.service';
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
    private readonly mediaAssets: MediaAssetRepository,
    private readonly notifications: NotificationsService,
    private readonly currencies: CurrenciesService,
  ) {}

  async create(actor: AuthenticatedUser, input: CreateListingInput) {
    const category = await this.validation.assertCategory(input.categoryId);
    const { city, country } = await this.validation.assertLocation(
      input.cityId,
      input.countryId,
    );
    this.validation.assertPrice(input.primaryPrice, input.secondaryPrice);

    const primaryCurrency = await this.currencies.resolvePrimaryCurrency({
      currencyCode: input.currencyCode,
      primaryCurrencyId: input.primaryCurrencyId,
    });
    if (input.secondaryCurrencyId) {
      await this.currencies.assertActiveId(input.secondaryCurrencyId);
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
      domain:
        category.code === ListingCategoryCode.PLATE
          ? MarketplaceDomain.PLATE
          : MarketplaceDomain.VEHICLE,
      status: ListingStatus.DRAFT,
      country: { connect: { id: country.id } },
      city: { connect: { id: city.id } },
      conditionType: input.conditionTypeId
        ? { connect: { id: input.conditionTypeId } }
        : undefined,
      primaryPrice: input.primaryPrice,
      primaryCurrency: { connect: { id: primaryCurrency.id } },
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
      currencyCode: query.currencyCode,
      primaryCurrencyId: query.primaryCurrencyId,
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

    let primaryCurrencyId: string | undefined;
    if (input.currencyCode || input.primaryCurrencyId) {
      const currency = await this.currencies.resolvePrimaryCurrency({
        currencyCode: input.currencyCode,
        primaryCurrencyId: input.primaryCurrencyId,
      });
      primaryCurrencyId = currency.id;
    }
    if (input.secondaryCurrencyId) {
      await this.currencies.assertActiveId(input.secondaryCurrencyId);
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

    const previousPrice =
      listing.primaryPrice != null ? Number(listing.primaryPrice) : null;
    const nextPrice =
      input.primaryPrice !== undefined ? input.primaryPrice : previousPrice;

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
        primaryCurrency: primaryCurrencyId
          ? { connect: { id: primaryCurrencyId } }
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

    if (
      nextPrice != null &&
      previousPrice != null &&
      nextPrice !== previousPrice
    ) {
      await this.notifications.notifyPriceChange(listing.id, previousPrice, nextPrice);
    }

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

    const previousStatus = listing.status;

    const updated = await this.listings.update(listing.id, {
      status,
      publishedAt:
        status === ListingStatus.ACTIVE
          ? listing.publishedAt ?? new Date()
          : listing.publishedAt,
      soldAt: status === ListingStatus.SOLD ? new Date() : listing.soldAt,
      updatedBy: { connect: { id: actor.id } },
    });

    if (
      previousStatus === ListingStatus.PENDING &&
      (status === ListingStatus.ACTIVE || status === ListingStatus.REJECTED) &&
      listing.sellerId
    ) {
      await this.notifications.notifyListingStatus(
        listing.sellerId,
        listing.id,
        status,
      );
    }

    return this.toResponse(updated);
  }

  async addMedia(id: string, actor: AuthenticatedUser, input: AddMediaInput) {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFoundException('Listing not found');
    this.assertCanManage(listing, actor);

    const mediaType = parseApiMediaType(input.mediaType);
    this.validation.assertMediaType(mediaType);

    let r2Key = input.r2Key?.trim() ?? '';
    let mimeType = input.mimeType;
    let byteSize = input.byteSize;
    let width: number | undefined;
    let height: number | undefined;
    let thumbnailKey: string | null | undefined;
    const mediaAssetId = input.mediaAssetId?.trim() || undefined;
    let documentPurpose = input.documentPurpose?.trim().toUpperCase() || undefined;

    if (mediaType === MediaType.DOCUMENT) {
      if (
        documentPurpose &&
        !(DOCUMENT_PURPOSES as readonly string[]).includes(documentPurpose)
      ) {
        throw new BadRequestException(
          `documentPurpose must be one of: ${DOCUMENT_PURPOSES.join(', ')}`,
        );
      }
    } else if (documentPurpose) {
      throw new BadRequestException('documentPurpose is only valid for DOCUMENT media');
    }

    const isStaff = canModerateListings(actor.role, actor.permissions);

    if (mediaAssetId) {
      const asset = await this.mediaAssets.findById(mediaAssetId);
      if (!asset) throw new NotFoundException('Media asset not found');
      if (asset.status !== MediaAssetStatus.READY) {
        throw new BadRequestException(
          'Media asset must be READY before attach',
        );
      }
      // Sellers must own the asset; null ownerId is not attachable (soft-skip closed).
      if (!isStaff) {
        if (!asset.ownerId || asset.ownerId !== actor.id) {
          throw new ForbiddenException('Not allowed to attach this media asset');
        }
      }
      r2Key = asset.originalKey;
      mimeType = mimeType ?? asset.mimeType;
      byteSize = byteSize ?? asset.byteSize;
      width = asset.width ?? undefined;
      height = asset.height ?? undefined;
      const thumbVariant = asset.variants.find(
        (v) => v.kind === MediaVariantKind.THUMBNAIL,
      );
      thumbnailKey = thumbVariant?.r2Key ?? null;
      if (asset.documentPurpose && !documentPurpose) {
        documentPurpose = asset.documentPurpose;
      }
      if (documentPurpose && asset.documentPurpose !== documentPurpose) {
        await this.mediaAssets.update(asset.id, { documentPurpose });
      }
      await this.mediaAssets.update(asset.id, {
        ownerModule: 'listings',
        ownerEntityId: listing.id,
      });
    } else if (input.r2Key?.trim()) {
      if (!isStaff) {
        throw new ForbiddenException(
          'Attaching by r2Key is restricted to moderators; use mediaAssetId',
        );
      }
      r2Key = input.r2Key.trim();
    } else {
      throw new BadRequestException('mediaAssetId is required');
    }

    const count = await this.media.countActive(listing.id);
    this.validation.assertMediaLimits(count);

    const sortOrder =
      input.sortOrder !== undefined
        ? input.sortOrder
        : await this.media.nextSortOrder(listing.id);

    if (thumbnailKey === undefined) {
      const thumb = await this.thumbnails.generate({
        r2Key,
        mediaType,
        sourceBuffer: input.sourceBuffer,
      });
      thumbnailKey = thumb.thumbnailKey;
      mimeType = mimeType ?? thumb.mimeType ?? undefined;
      byteSize = byteSize ?? thumb.byteSize ?? undefined;
      width = width ?? thumb.width ?? undefined;
      height = height ?? thumb.height ?? undefined;
    }

    const created = await this.media.create({
      listing: { connect: { id: listing.id } },
      mediaAsset: mediaAssetId ? { connect: { id: mediaAssetId } } : undefined,
      r2Key,
      thumbnailKey: thumbnailKey ?? null,
      mediaType,
      mimeType: mimeType ?? null,
      byteSize: byteSize ?? null,
      width: width ?? null,
      height: height ?? null,
      sortOrder,
      confirmed: input.confirmed ?? true,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });

    return this.mapListingMedia(created);
  }

  async reorderMedia(
    listingId: string,
    actor: AuthenticatedUser,
    orderedIds: string[],
  ) {
    const listing = await this.listings.findById(listingId);
    if (!listing) throw new NotFoundException('Listing not found');
    this.assertCanManage(listing, actor);

    try {
      const items = await this.media.reorder(listingId, orderedIds, actor.id);
      return items.map((m) => this.mapListingMedia(m));
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to reorder media',
      );
    }
  }

  async setPrimaryMedia(
    listingId: string,
    mediaId: string,
    actor: AuthenticatedUser,
  ) {
    const listing = await this.listings.findById(listingId);
    if (!listing) throw new NotFoundException('Listing not found');
    this.assertCanManage(listing, actor);

    try {
      const items = await this.media.setPrimary(listingId, mediaId, actor.id);
      return items.map((m) => this.mapListingMedia(m));
    } catch {
      throw new NotFoundException('Media not found');
    }
  }

  async removeMedia(listingId: string, mediaId: string, actor: AuthenticatedUser) {
    const listing = await this.listings.findById(listingId);
    if (!listing) throw new NotFoundException('Listing not found');
    this.assertCanManage(listing, actor);

    const item = await this.media.findById(mediaId);
    if (!item || item.listingId !== listingId) {
      throw new NotFoundException('Media not found');
    }

    // Soft-delete listing row only; platform MediaAsset lifecycle is independent.
    await this.media.softDelete(mediaId, actor.id);
    return { success: true as const };
  }

  private mapListingMedia(created: {
    id: string;
    listingId: string;
    mediaAssetId?: string | null;
    r2Key: string;
    thumbnailKey: string | null;
    mediaType: MediaType;
    mimeType: string | null;
    byteSize: number | null;
    width: number | null;
    height: number | null;
    sortOrder: number;
    confirmed: boolean;
    createdAt: Date;
    mediaAsset?: {
      blurDataUrl: string | null;
      documentPurpose: string | null;
      variants: Array<{
        kind: MediaVariantKind;
        r2Key: string;
        mimeType: string;
        width: number | null;
        height: number | null;
      }>;
    } | null;
  }) {
    return {
      id: created.id,
      listingId: created.listingId,
      mediaAssetId: created.mediaAssetId ?? null,
      r2Key: created.r2Key,
      thumbnailKey: created.thumbnailKey,
      mediaType: toApiMediaType(created.mediaType),
      mimeType: created.mimeType,
      byteSize: created.byteSize,
      width: created.width,
      height: created.height,
      sortOrder: created.sortOrder,
      confirmed: created.confirmed,
      isPrimary: created.sortOrder === 0,
      blurDataUrl: created.mediaAsset?.blurDataUrl ?? null,
      documentPurpose: created.mediaAsset?.documentPurpose ?? null,
      variants: (created.mediaAsset?.variants ?? []).map((v) => ({
        kind: v.kind,
        r2Key: v.r2Key,
        mimeType: v.mimeType,
        width: v.width,
        height: v.height,
      })),
      createdAt: created.createdAt,
    };
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
    if (categoryCode === ListingCategoryCode.PLATE) {
      if (!input.plateDetails) {
        throw new BadRequestException('plateDetails is required for PLATE listings');
      }
      const plate = input.plateDetails;
      const plateDisplay = plate.plateDisplay.trim();
      const plateNormalized =
        plate.plateNormalized?.trim().toUpperCase() ||
        plateDisplay.replace(/\s+/g, '').toUpperCase();
      return {
        plateDetails: {
          create: {
            formatCode: plate.formatCode.trim(),
            plateDisplay,
            plateNormalized,
            series: plate.series?.trim(),
            number: plate.number?.trim(),
            regionCode: plate.regionCode?.trim(),
            plateType: plate.plateType?.trim(),
          },
        },
      };
    }

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
            vin: vehicle.vin?.trim(),
            trim: vehicle.trim?.trim(),
            seats: vehicle.seats,
            interiorColor: vehicle.interiorColor?.trim(),
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
    if (categoryCode === ListingCategoryCode.PLATE && input.plateDetails) {
      const plate = input.plateDetails;
      const plateDisplay = plate.plateDisplay.trim();
      const plateNormalized =
        plate.plateNormalized?.trim().toUpperCase() ||
        plateDisplay.replace(/\s+/g, '').toUpperCase();
      const data = {
        formatCode: plate.formatCode.trim(),
        plateDisplay,
        plateNormalized,
        series: plate.series?.trim(),
        number: plate.number?.trim(),
        regionCode: plate.regionCode?.trim(),
        plateType: plate.plateType?.trim(),
      };
      return {
        plateDetails: {
          upsert: {
            create: data,
            update: data,
          },
        },
      };
    }

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
      vin: vehicle.vin?.trim(),
      trim: vehicle.trim?.trim(),
      seats: vehicle.seats,
      interiorColor: vehicle.interiorColor?.trim(),
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

  async recordContactClick(id: string, channel: 'phone' | 'whatsapp') {
    const listing = await this.listings.findById(id);
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException('Contact is only available for active listings');
    }

    const updated = await this.listings.client.listing.update({
      where: { id },
      data:
        channel === 'phone'
          ? { phoneClicks: { increment: 1 } }
          : { whatsappClicks: { increment: 1 } },
      select: { phoneClicks: true, whatsappClicks: true },
    });

    return { ok: true, ...updated };
  }

  private toResponse(listing: ListingWithRelations) {
    const dealer = listing.seller?.dealerMemberships?.[0]?.organization ?? null;
    const phone = dealer?.phone ?? listing.seller?.phone ?? null;
    const whatsapp = dealer?.whatsapp ?? phone;

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
      price: listing.primaryPrice != null ? Number(listing.primaryPrice) : null,
      primaryCurrencyId: listing.primaryCurrencyId,
      currencyCode: listing.primaryCurrency?.code ?? null,
      primaryCurrency: listing.primaryCurrency
        ? {
            id: listing.primaryCurrency.id,
            code: listing.primaryCurrency.code,
            symbol: listing.primaryCurrency.symbol,
            decimalPlaces: listing.primaryCurrency.decimalPlaces,
          }
        : null,
      secondaryPrice:
        listing.secondaryPrice != null ? Number(listing.secondaryPrice) : null,
      secondaryCurrencyId: listing.secondaryCurrencyId,
      secondaryCurrencyCode: listing.secondaryCurrency?.code ?? null,
      slug: listing.slug,
      metaTitle: listing.metaTitle,
      metaDescription: listing.metaDescription,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      verificationStatus: listing.verificationStatus,
      viewsCount: listing.viewsCount,
      favoritesCount: listing.favoritesCount,
      phoneClicks: listing.phoneClicks,
      whatsappClicks: listing.whatsappClicks,
      publishedAt: listing.publishedAt,
      soldAt: listing.soldAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      latitude: listing.latitude != null ? Number(listing.latitude) : null,
      longitude: listing.longitude != null ? Number(listing.longitude) : null,
      locationText: listing.locationText,
      features: listing.features ?? [],
      translations: listing.translations.map((t) => ({
        language: t.language,
        title: t.title,
        description: t.description,
      })),
      media: listing.media.map((m) => this.mapListingMedia(m)),
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
      sellerContact: listing.status === ListingStatus.ACTIVE
        ? {
            displayName: dealer?.name ?? listing.seller?.displayName ?? null,
            phone,
            whatsapp,
            dealerSlug: dealer?.slug ?? null,
            dealerName: dealer?.name ?? null,
            dealerVerified: dealer?.verified ?? false,
            dealerLogoUrl: dealer?.logoUrl ?? null,
          }
        : null,
    };
  }
}
