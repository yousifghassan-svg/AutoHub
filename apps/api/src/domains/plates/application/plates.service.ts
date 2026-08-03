import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LanguageCode,
  ListingStatus,
  PlateVerificationStatus,
} from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { ListingsService } from '../../listings/application/listings.service';
import { CurrenciesService } from '../../currencies/application/currencies.service';
import { listingContentEditBlockedMessage } from '../../listings/domain/listing-status';
import { uniqueSlug } from '../../listings/infrastructure/slug.util';
import { canManagePlate, canViewPlate } from '../domain/plate.policies';
import {
  PlateRepository,
  type PlateListingWithRelations,
} from '../infrastructure/plate.repository';
import { PlateCatalogService } from './plate-catalog.service';

export type CreatePlateInput = {
  categoryId: string;
  cityId: string;
  countryId?: string;
  title: string;
  description: string;
  language?: LanguageCode;
  primaryPrice: number;
  currencyCode?: string;
  primaryCurrencyId?: string;
  formatCode: string;
  regionCode: string;
  series: string;
  number: string;
  plateType?: string;
  plateCategoryId?: string;
  platePrefixId?: string;
};

export type UpdatePlateInput = Partial<Omit<CreatePlateInput, 'categoryId'>>;

export type VerifyPlateInput = {
  status: PlateVerificationStatus;
  note?: string;
};

@Injectable()
export class PlatesService {
  constructor(
    private readonly plates: PlateRepository,
    private readonly catalog: PlateCatalogService,
    private readonly listings: ListingsService,
    private readonly currencies: CurrenciesService,
  ) {}

  async list(params: Parameters<PlateRepository['search']>[0], actor?: AuthenticatedUser) {
    if (!actor) {
      return this.plates.search({ ...params, status: ListingStatus.ACTIVE });
    }
    if (params.sellerId !== actor.id) {
      return this.plates.search({ ...params, status: ListingStatus.ACTIVE });
    }
    return this.plates.search(params);
  }

  async findById(id: string, actor?: AuthenticatedUser) {
    const plate = await this.plates.findById(id);
    if (!plate) throw new NotFoundException('Plate listing not found');

    if (!canViewPlate({ status: plate.status, sellerId: plate.sellerId, actor })) {
      throw new NotFoundException('Plate listing not found');
    }

    return this.toResponse(plate);
  }

  async create(actor: AuthenticatedUser, input: CreatePlateInput) {
    const display = `${input.regionCode.trim()} ${input.series.trim().toUpperCase()} ${input.number.trim()}`;
    const normalized = display.replace(/\s+/g, '').toUpperCase();
    await this.assertNoDuplicate(normalized);

    const format = await this.plates.findFormatByCode(input.formatCode);
    if (!format) throw new BadRequestException('Unknown plate format');

    const city = await this.plates.findCityWithGovernorate(input.cityId);
    const countryId = input.countryId ?? city.governorate.countryId;
    const title = input.title.trim();
    const slug = uniqueSlug(`plate-${normalized.toLowerCase()}`);
    this.currencies.assertPrice(input.primaryPrice);
    const primaryCurrency = await this.currencies.resolvePrimaryCurrency({
      currencyCode: input.currencyCode,
      primaryCurrencyId: input.primaryCurrencyId,
    });

    const created = await this.plates.create({
      seller: { connect: { id: actor.id } },
      category: { connect: { id: input.categoryId } },
      status: ListingStatus.DRAFT,
      country: { connect: { id: countryId } },
      city: { connect: { id: input.cityId } },
      primaryPrice: input.primaryPrice,
      primaryCurrency: { connect: { id: primaryCurrency.id } },
      slug,
      metaTitle: title,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
      translations: {
        create: {
          language: input.language ?? LanguageCode.ar,
          title,
          description: input.description.trim(),
          createdById: actor.id,
          updatedById: actor.id,
        },
      },
      plateDetails: {
        create: {
          format: { connect: { code: input.formatCode.trim() } },
          plateDisplay: display,
          plateNormalized: normalized,
          series: input.series.trim().toUpperCase(),
          number: input.number.trim(),
          regionCode: input.regionCode.trim(),
          plateType: input.plateType?.trim(),
          plateCategory: input.plateCategoryId
            ? { connect: { id: input.plateCategoryId } }
            : undefined,
          platePrefix: input.platePrefixId
            ? { connect: { id: input.platePrefixId } }
            : undefined,
        },
      },
    });

    return this.toResponse(created);
  }

  async update(id: string, actor: AuthenticatedUser, input: UpdatePlateInput) {
    const existing = await this.plates.findById(id);
    if (!existing) throw new NotFoundException('Plate listing not found');
    this.assertCanManage(existing, actor);

    const contentBlocked = listingContentEditBlockedMessage(existing.status);
    if (contentBlocked) {
      throw new BadRequestException(contentBlocked);
    }

    const regionCode = input.regionCode ?? existing.plateDetails?.regionCode ?? '';
    const series = (input.series ?? existing.plateDetails?.series ?? '').toUpperCase();
    const number = input.number ?? existing.plateDetails?.number ?? '';
    const display = `${regionCode} ${series} ${number}`.trim();
    const normalized = display.replace(/\s+/g, '').toUpperCase();

    if (normalized && normalized !== existing.plateDetails?.plateNormalized) {
      await this.assertNoDuplicate(normalized, id);
    }

    let primaryCurrencyId = input.primaryCurrencyId;
    if (input.currencyCode || input.primaryCurrencyId) {
      const currency = await this.currencies.resolvePrimaryCurrency({
        currencyCode: input.currencyCode,
        primaryCurrencyId: input.primaryCurrencyId,
      });
      primaryCurrencyId = currency.id;
    }
    if (input.primaryPrice !== undefined) {
      this.currencies.assertPrice(input.primaryPrice);
    }

    const updated = await this.plates.updateWithDetails(id, {
      listing: {
        cityId: input.cityId,
        primaryPrice: input.primaryPrice,
        primaryCurrencyId,
        updatedById: actor.id,
      },
      plateDetails: existing.plateDetails
        ? {
            format: {
              connect: {
                code: input.formatCode ?? existing.plateDetails.formatCode,
              },
            },
            plateDisplay: display || existing.plateDetails.plateDisplay,
            plateNormalized: normalized || existing.plateDetails.plateNormalized,
            series: series || existing.plateDetails.series,
            number: number || existing.plateDetails.number,
            regionCode: regionCode || existing.plateDetails.regionCode,
            plateType: input.plateType ?? existing.plateDetails.plateType,
            ...(input.plateCategoryId
              ? { plateCategory: { connect: { id: input.plateCategoryId } } }
              : {}),
            ...(input.platePrefixId
              ? { platePrefix: { connect: { id: input.platePrefixId } } }
              : {}),
          }
        : undefined,
      translation:
        existing.translations[0] && (input.title || input.description)
          ? {
              language: existing.translations[0].language,
              title: input.title?.trim() ?? existing.translations[0].title,
              description:
                input.description?.trim() ?? existing.translations[0].description,
              updatedById: actor.id,
            }
          : undefined,
    });

    return this.toResponse(updated);
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const existing = await this.plates.findById(id);
    if (!existing) throw new NotFoundException('Plate listing not found');
    this.assertCanManage(existing, actor);
    const deleted = await this.plates.softDelete(id, actor.id);
    return this.toResponse(deleted);
  }

  async changeStatus(id: string, actor: AuthenticatedUser, status: ListingStatus) {
    const existing = await this.plates.findById(id);
    if (!existing) throw new NotFoundException('Plate listing not found');
    await this.listings.changeStatus(id, actor, status);
    const updated = await this.plates.findById(id);
    if (!updated) throw new NotFoundException('Plate listing not found');
    return this.toResponse(updated);
  }

  async contactClick(id: string, channel: 'phone' | 'whatsapp') {
    const existing = await this.plates.findById(id);
    if (!existing) throw new NotFoundException('Plate listing not found');
    return this.listings.recordContactClick(id, channel);
  }

  verify(id: string, input: VerifyPlateInput, actor: AuthenticatedUser) {
    return this.catalog.verifyPlate(id, input, actor);
  }

  private assertCanManage(
    listing: PlateListingWithRelations,
    actor: AuthenticatedUser,
  ) {
    if (
      !canManagePlate({
        actorId: actor.id,
        actorRole: actor.role,
        sellerId: listing.sellerId,
      })
    ) {
      throw new ForbiddenException('You can only modify your own plate listings');
    }
  }

  private async assertNoDuplicate(normalized: string, excludeListingId?: string) {
    const existing = await this.plates.findDuplicateNormalized(normalized, excludeListingId);
    if (existing) {
      throw new ConflictException('An active listing already uses this plate');
    }
  }

  private toResponse(listing: PlateListingWithRelations) {
    return {
      id: listing.id,
      domain: listing.domain,
      status: listing.status,
      categoryId: listing.categoryId,
      categoryCode: listing.categoryCode,
      sellerId: listing.sellerId,
      cityId: listing.cityId,
      countryId: listing.countryId,
      primaryPrice:
        listing.primaryPrice != null ? Number(listing.primaryPrice) : null,
      price: listing.primaryPrice != null ? Number(listing.primaryPrice) : null,
      primaryCurrencyId: listing.primaryCurrencyId,
      currencyCode: listing.primaryCurrency?.code ?? null,
      slug: listing.slug,
      metaTitle: listing.metaTitle,
      publishedAt: listing.publishedAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      translations: listing.translations,
      plateDetails: listing.plateDetails,
      city: listing.city,
      country: listing.country,
      primaryCurrency: listing.primaryCurrency,
      seller: listing.seller,
      category: listing.category,
      media: listing.media,
    };
  }
}
