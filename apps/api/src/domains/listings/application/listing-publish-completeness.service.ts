import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ListingCategoryCode,
  MarketplaceDomain,
  MediaType,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export type PublishCompletenessError = {
  field: string;
  message: string;
  step: string;
};

/**
 * Canonical publish gate for DRAFT|REJECTED → PENDING.
 * Vehicle domain only in Priority 3; plates keep existing behavior.
 */
@Injectable()
export class ListingPublishCompletenessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertReadyForPending(listingId: string): Promise<void> {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
      include: {
        translations: { where: { deletedAt: null } },
        media: {
          where: { deletedAt: null, mediaType: MediaType.IMAGE },
          select: { id: true },
        },
        carDetails: true,
        motorcycleDetails: true,
        truckDetails: true,
        heavyEquipmentDetails: true,
        primaryCurrency: true,
      },
    });

    if (!listing) {
      throw new BadRequestException('Listing not found');
    }

    if (listing.domain !== MarketplaceDomain.VEHICLE) {
      return;
    }

    const errors: PublishCompletenessError[] = [];
    const translation =
      listing.translations.find((t) => t.language === 'ar') ??
      listing.translations[0];
    const title = translation?.title?.trim() ?? '';
    const description = translation?.description?.trim() ?? '';

    if (title.length < 3 || title.toLowerCase() === 'draft') {
      errors.push({
        field: 'title',
        message: 'Title must be at least 3 characters',
        step: 'vehicleDetails',
      });
    }
    if (description.length < 10) {
      errors.push({
        field: 'description',
        message: 'Description must be at least 10 characters',
        step: 'vehicleDetails',
      });
    }
    if (!listing.cityId) {
      errors.push({
        field: 'cityId',
        message: 'City is required',
        step: 'category',
      });
    }
    if (!listing.categoryId) {
      errors.push({
        field: 'categoryId',
        message: 'Category is required',
        step: 'category',
      });
    }

    const price =
      listing.primaryPrice != null ? Number(listing.primaryPrice) : null;
    if (price == null || Number.isNaN(price) || price <= 0) {
      errors.push({
        field: 'primaryPrice',
        message: 'Price must be greater than 0',
        step: 'saleInformation',
      });
    }
    if (!listing.primaryCurrencyId && !listing.primaryCurrency) {
      errors.push({
        field: 'currencyCode',
        message: 'Currency is required',
        step: 'saleInformation',
      });
    }

    const details =
      listing.carDetails ??
      listing.motorcycleDetails ??
      listing.truckDetails ??
      listing.heavyEquipmentDetails;
    const needsYear =
      listing.categoryCode === ListingCategoryCode.CAR ||
      listing.categoryCode === ListingCategoryCode.MOTORCYCLE ||
      listing.categoryCode === ListingCategoryCode.TRUCK;

    if (needsYear && (details == null || details.year == null)) {
      errors.push({
        field: 'vehicleDetails.year',
        message: 'Year is required',
        step: 'vehicleDetails',
      });
    }

    const vin =
      listing.carDetails && 'vin' in listing.carDetails
        ? listing.carDetails.vin
        : null;
    if (vin) {
      const normalized = vin.trim().toUpperCase();
      if (!/^[A-HJ-NPR-Z0-9]{11,17}$/.test(normalized)) {
        errors.push({
          field: 'vehicleDetails.vin',
          message: 'VIN must be 11–17 alphanumeric characters (no I/O/Q)',
          step: 'vehicleDetails',
        });
      }
    }

    if (listing.media.length < 1) {
      errors.push({
        field: 'media',
        message: 'At least one image is required',
        step: 'media',
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Listing is incomplete and cannot be submitted for review',
        error: 'LISTING_INCOMPLETE',
        details: { errors },
      });
    }
  }
}
