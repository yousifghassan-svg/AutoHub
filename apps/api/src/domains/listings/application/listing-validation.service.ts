import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Listing, ListingCategoryCode, MediaType } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { assertSupportedListingMedia } from '../domain/media-type';

@Injectable()
export class ListingValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCategory(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, active: true, deletedAt: null },
    });
    if (!category) throw new BadRequestException('Invalid or inactive category');
    return category;
  }

  async assertLocation(cityId: string, countryId?: string) {
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

  async assertCurrency(currencyId: string) {
    const currency = await this.prisma.currency.findFirst({
      where: { id: currencyId, active: true, deletedAt: null },
    });
    if (!currency) throw new BadRequestException('Invalid or inactive currency');
    return currency;
  }

  assertPrice(primaryPrice?: number | null, secondaryPrice?: number | null) {
    if (primaryPrice !== undefined && primaryPrice !== null && primaryPrice < 0) {
      throw new BadRequestException('primaryPrice must be >= 0');
    }
    if (
      secondaryPrice !== undefined &&
      secondaryPrice !== null &&
      secondaryPrice < 0
    ) {
      throw new BadRequestException('secondaryPrice must be >= 0');
    }
  }

  assertMediaType(mediaType: MediaType) {
    assertSupportedListingMedia(mediaType);
  }

  assertMediaLimits(count: number, max = 100) {
    if (count >= max) {
      throw new BadRequestException(`A listing may have at most ${max} media items`);
    }
  }

  async assertBrandModel(input: {
    categoryCode: ListingCategoryCode;
    brandId?: string;
    modelId?: string;
  }) {
    if (!input.brandId && !input.modelId) return;

    if (input.modelId && !input.brandId) {
      throw new BadRequestException('brandId is required when modelId is provided');
    }

    if (input.brandId) {
      const brand = await this.prisma.vehicleBrand.findFirst({
        where: {
          id: input.brandId,
          active: true,
          deletedAt: null,
        },
      });
      if (!brand) throw new BadRequestException('Invalid brand');
    }

    if (input.modelId && input.brandId) {
      const model = await this.prisma.vehicleModel.findFirst({
        where: {
          id: input.modelId,
          brandId: input.brandId,
          active: true,
          deletedAt: null,
        },
      });
      if (!model) throw new BadRequestException('Invalid model for brand');
    }
  }

  async requireListingExists(id: string): Promise<Listing> {
    const listing = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }
}
