import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingCategoryCode, ListingStatus } from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { ListingsService } from '../../listings/application/listings.service';
import { ListingValidationService } from '../../listings/application/listing-validation.service';
import {
  canManageVehicle,
  canModerateVehicles,
} from '../domain/vehicle.policies';
import { VEHICLE_DOMAIN } from '../domain/vehicle.constants';
import {
  VehicleRepository,
  type VehicleWithRelations,
} from '../infrastructure/vehicle.repository';
import type {
  CreateVehicleInput,
  ListVehiclesInput,
  UpdateVehicleInput,
} from './types/vehicle.input';
import { toApiMediaType } from '../../listings/domain/media-type';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly vehicles: VehicleRepository,
    private readonly listings: ListingsService,
    private readonly validation: ListingValidationService,
  ) {}

  async create(actor: AuthenticatedUser, input: CreateVehicleInput) {
    const category = await this.validation.assertCategory(input.categoryId);
    if (category.code === ListingCategoryCode.PLATE) {
      throw new BadRequestException('PLATE category is not allowed in the vehicles domain');
    }

    const listing = await this.listings.create(actor, {
      categoryId: input.categoryId,
      cityId: input.cityId,
      countryId: input.countryId,
      conditionTypeId: input.conditionTypeId,
      title: input.title,
      description: input.description,
      language: input.language,
      slug: input.slug,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      primaryPrice: input.primaryPrice,
      currencyCode: input.currencyCode,
      primaryCurrencyId: input.primaryCurrencyId,
      secondaryPrice: input.secondaryPrice,
      secondaryCurrencyId: input.secondaryCurrencyId,
      features: input.features,
      draftStep: input.draftStep,
      carDetails: input.vehicleDetails,
      vehicleDetails: input.vehicleDetails,
    });

    if (listing.id) {
      await this.vehicles.client.listing.update({
        where: { id: listing.id },
        data: { domain: VEHICLE_DOMAIN },
      });
    }

    const vehicle = await this.vehicles.findById(listing.id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.mapVehicleResponse(vehicle);
  }

  async findById(id: string, actor?: AuthenticatedUser) {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    if (!this.canView(vehicle, actor)) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.mapVehicleResponse(vehicle);
  }

  async list(query: ListVehiclesInput, actor?: AuthenticatedUser) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const isStaff = actor ? canModerateVehicles(actor.role, actor.permissions) : false;
    const status = query.status;
    let statuses = query.statuses;
    const sellerId = query.mine ? actor?.id : query.sellerId;

    if (query.mine && !actor) {
      throw new ForbiddenException('Authentication required for mine=true');
    }

    const viewingOwn = Boolean(actor && sellerId && sellerId === actor.id);

    if (!isStaff && !viewingOwn) {
      if (!status && !statuses?.length) {
        statuses = [ListingStatus.ACTIVE];
      } else if (status && status !== ListingStatus.ACTIVE) {
        throw new ForbiddenException('Only ACTIVE vehicles are publicly searchable');
      } else if (statuses?.some((s) => s !== ListingStatus.ACTIVE)) {
        throw new ForbiddenException('Only ACTIVE vehicles are publicly searchable');
      }
    }

    const { items, total } = await this.vehicles.list({
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
      status,
      statuses,
      isFeatured: query.isFeatured,
      keyword: query.keyword,
      sellerId,
    });

    return {
      items: items.map((item) => this.mapVehicleResponse(item)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
    };
  }

  async update(id: string, actor: AuthenticatedUser, input: UpdateVehicleInput) {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    this.assertCanManage(vehicle, actor);

    const updated = await this.listings.update(id, actor, {
      cityId: input.cityId,
      countryId: input.countryId,
      conditionTypeId: input.conditionTypeId,
      title: input.title,
      description: input.description,
      language: input.language,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      primaryPrice: input.primaryPrice,
      currencyCode: input.currencyCode,
      primaryCurrencyId: input.primaryCurrencyId,
      secondaryPrice: input.secondaryPrice,
      secondaryCurrencyId: input.secondaryCurrencyId,
      isFeatured: input.isFeatured,
      features: input.features,
      draftStep: input.draftStep,
      carDetails: input.vehicleDetails,
      vehicleDetails: input.vehicleDetails,
    });

    return this.toVehicleResponseFromListing(updated);
  }

  async softDelete(id: string, actor: AuthenticatedUser) {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    this.assertCanManage(vehicle, actor);

    const deleted = await this.listings.softDelete(id, actor);
    return this.toVehicleResponseFromListing(deleted);
  }

  async changeStatus(
    id: string,
    actor: AuthenticatedUser,
    status: ListingStatus,
  ) {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const updated = await this.listings.changeStatus(id, actor, status);
    return this.toVehicleResponseFromListing(updated);
  }

  async contactClick(id: string, channel: 'phone' | 'whatsapp') {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    return this.listings.recordContactClick(id, channel);
  }

  private canView(
    vehicle: { status: ListingStatus; sellerId: string | null },
    actor?: AuthenticatedUser,
  ): boolean {
    if (vehicle.status === ListingStatus.ACTIVE) return true;
    if (!actor) return false;
    if (canModerateVehicles(actor.role, actor.permissions)) return true;
    return vehicle.sellerId === actor.id;
  }

  private assertCanManage(
    vehicle: { sellerId: string | null },
    actor: AuthenticatedUser,
  ) {
    if (
      !canManageVehicle({
        actorId: actor.id,
        actorRole: actor.role,
        sellerId: vehicle.sellerId,
      })
    ) {
      throw new ForbiddenException('You can only modify your own vehicles');
    }
  }

  private toVehicleResponseFromListing(listing: Record<string, unknown>) {
    return {
      ...listing,
      domain: VEHICLE_DOMAIN,
      vehicleDetails: this.extractVehicleDetails(listing),
      carDetails: undefined,
      motorcycleDetails: undefined,
      truckDetails: undefined,
      heavyEquipmentDetails: undefined,
      plateDetails: undefined,
    };
  }

  mapVehicleResponse(vehicle: VehicleWithRelations) {
    const dealer = vehicle.seller?.dealerMemberships?.[0]?.organization ?? null;
    const phone = dealer?.phone ?? vehicle.seller?.phone ?? null;
    const whatsapp = dealer?.whatsapp ?? phone;

    return {
      id: vehicle.id,
      domain: vehicle.domain,
      sellerId: vehicle.sellerId,
      categoryId: vehicle.categoryId,
      categoryCode: vehicle.categoryCode,
      status: vehicle.status,
      countryId: vehicle.countryId,
      cityId: vehicle.cityId,
      governorateId: vehicle.city.governorateId,
      conditionTypeId: vehicle.conditionTypeId,
      primaryPrice:
        vehicle.primaryPrice != null ? Number(vehicle.primaryPrice) : null,
      price: vehicle.primaryPrice != null ? Number(vehicle.primaryPrice) : null,
      primaryCurrencyId: vehicle.primaryCurrencyId,
      currencyCode: vehicle.primaryCurrency?.code ?? null,
      primaryCurrency: vehicle.primaryCurrency
        ? {
            id: vehicle.primaryCurrency.id,
            code: vehicle.primaryCurrency.code,
            symbol: vehicle.primaryCurrency.symbol,
            decimalPlaces: vehicle.primaryCurrency.decimalPlaces,
          }
        : null,
      secondaryPrice:
        vehicle.secondaryPrice != null ? Number(vehicle.secondaryPrice) : null,
      secondaryCurrencyId: vehicle.secondaryCurrencyId,
      secondaryCurrencyCode: vehicle.secondaryCurrency?.code ?? null,
      slug: vehicle.slug,
      metaTitle: vehicle.metaTitle,
      metaDescription: vehicle.metaDescription,
      isFeatured: vehicle.isFeatured,
      isVerified: vehicle.isVerified,
      verificationStatus: vehicle.verificationStatus,
      viewsCount: vehicle.viewsCount,
      favoritesCount: vehicle.favoritesCount,
      phoneClicks: vehicle.phoneClicks,
      whatsappClicks: vehicle.whatsappClicks,
      publishedAt: vehicle.publishedAt,
      soldAt: vehicle.soldAt,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      latitude: vehicle.latitude != null ? Number(vehicle.latitude) : null,
      longitude: vehicle.longitude != null ? Number(vehicle.longitude) : null,
      locationText: vehicle.locationText,
      features: vehicle.features ?? [],
      draftStep: vehicle.draftStep ?? null,
      translations: vehicle.translations.map((t) => ({
        language: t.language,
        title: t.title,
        description: t.description,
      })),
      media: vehicle.media.map((m) => ({
        id: m.id,
        listingId: m.listingId,
        mediaAssetId: m.mediaAssetId ?? null,
        r2Key: m.r2Key,
        thumbnailKey: m.thumbnailKey,
        mediaType: toApiMediaType(m.mediaType),
        mimeType: m.mimeType,
        byteSize: m.byteSize,
        width: m.width,
        height: m.height,
        sortOrder: m.sortOrder,
        confirmed: m.confirmed,
        isPrimary: m.sortOrder === 0,
        blurDataUrl: m.mediaAsset?.blurDataUrl ?? null,
        documentPurpose: m.mediaAsset?.documentPurpose ?? null,
        variants: (m.mediaAsset?.variants ?? []).map((v) => ({
          kind: v.kind,
          r2Key: v.r2Key,
          mimeType: v.mimeType,
          width: v.width,
          height: v.height,
        })),
        createdAt: m.createdAt,
      })),
      vehicleDetails: this.extractVehicleDetails(vehicle),
      category: {
        id: vehicle.category.id,
        code: vehicle.category.code,
        slug: vehicle.category.slug,
        nameEn: vehicle.category.nameEn,
        nameAr: vehicle.category.nameAr,
      },
      city: {
        id: vehicle.city.id,
        slug: vehicle.city.slug,
        nameEn: vehicle.city.nameEn,
        nameAr: vehicle.city.nameAr,
        governorateId: vehicle.city.governorateId,
      },
      sellerContact:
        vehicle.status === ListingStatus.ACTIVE
          ? {
              displayName: dealer?.name ?? vehicle.seller?.displayName ?? null,
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

  private extractVehicleDetails(source: Record<string, unknown>) {
    return (
      source.carDetails ??
      source.motorcycleDetails ??
      source.truckDetails ??
      source.heavyEquipmentDetails ??
      null
    );
  }
}
