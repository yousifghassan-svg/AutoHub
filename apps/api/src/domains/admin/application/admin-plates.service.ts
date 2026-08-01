import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ListingCategoryCode,
  ListingStatus,
  MarketplaceDomain,
} from '@autohub/database';
import { AdminAuditService } from './admin-audit.service';
import { AdminListingsService } from './admin-listings.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { PlateRepository } from '../../plates/infrastructure/plate.repository';

export type AdminPlatesQuery = {
  page?: number;
  pageSize?: number;
  governorate?: string;
  code?: string;
  letter?: string;
  number?: string;
  plateType?: string;
  formatCode?: string;
  q?: string;
  status?: ListingStatus;
};

export type UpsertPlateInput = {
  listingId?: string;
  sellerId: string;
  cityId: string;
  countryId?: string;
  categoryId: string;
  title: string;
  description: string;
  primaryPrice?: number;
  formatCode: string;
  regionCode: string;
  series: string;
  number: string;
  plateType?: string;
  plateCategoryId?: string;
  platePrefixId?: string;
  status?: ListingStatus;
};

@Injectable()
export class AdminPlatesService {
  constructor(
    private readonly audit: AdminAuditService,
    private readonly plates: PlateRepository,
    private readonly listings: AdminListingsService,
  ) {}

  async list(query: AdminPlatesQuery) {
    return this.plates.search({
      page: query.page,
      pageSize: query.pageSize,
      province: query.governorate,
      formatCode: query.formatCode,
      prefix: query.letter,
      series: query.letter,
      number: query.number,
      plateType: query.plateType,
      keyword: query.q,
      status: query.status,
    });
  }

  async findById(id: string) {
    const listing = await this.plates.findById(id);
    if (!listing) throw new NotFoundException('Plate listing not found');
    return listing;
  }

  async approve(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.assertPlateListing(id);
    return this.listings.approve(id, actor, ctx);
  }

  async reject(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.assertPlateListing(id);
    return this.listings.reject(id, actor, ctx);
  }

  private async assertPlateListing(id: string) {
    const listing = await this.listings.findById(id);
    if (
      listing.domain === MarketplaceDomain.PLATE ||
      listing.categoryCode === ListingCategoryCode.PLATE
    ) {
      return;
    }
    throw new NotFoundException('Plate listing not found');
  }

  async create(
    input: UpsertPlateInput,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const display = `${input.regionCode.trim()} ${input.series.trim().toUpperCase()} ${input.number.trim()}`;
    const normalized = display.replace(/\s+/g, '').toUpperCase();
    await this.assertNoDuplicateActive(normalized);

    const format = await this.plates.findFormatByCode(input.formatCode);
    if (!format) throw new BadRequestException('Unknown plate format');

    const city = await this.plates.findCityWithGovernorate(input.cityId);
    const country = input.countryId ?? city.governorate.countryId;
    const slug = `plate-${normalized.toLowerCase()}-${Date.now().toString(36)}`;

    const created = await this.plates.create({
      seller: { connect: { id: input.sellerId } },
      category: { connect: { id: input.categoryId } },
      status: input.status ?? ListingStatus.ACTIVE,
      country: { connect: { id: country } },
      city: { connect: { id: input.cityId } },
      primaryPrice: input.primaryPrice,
      slug,
      metaTitle: input.title,
      publishedAt: new Date(),
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
      translations: {
        create: {
          language: 'ar',
          title: input.title,
          description: input.description,
          createdById: actor.id,
          updatedById: actor.id,
        },
      },
      plateDetails: {
        create: {
          format: { connect: { code: input.formatCode } },
          plateDisplay: display,
          plateNormalized: normalized,
          series: input.series.trim().toUpperCase(),
          number: input.number.trim(),
          regionCode: input.regionCode.trim(),
          plateType: input.plateType,
          plateCategory: input.plateCategoryId
            ? { connect: { id: input.plateCategoryId } }
            : undefined,
          platePrefix: input.platePrefixId
            ? { connect: { id: input.platePrefixId } }
            : undefined,
        },
      },
    });

    await this.audit.log({
      actorId: actor.id,
      action: 'plate.create',
      module: 'plates',
      entityId: created.id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      after: created,
    });

    return created;
  }

  async update(
    id: string,
    input: Partial<UpsertPlateInput>,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    const regionCode = input.regionCode ?? before.plateDetails?.regionCode ?? '';
    const series = (input.series ?? before.plateDetails?.series ?? '').toUpperCase();
    const number = input.number ?? before.plateDetails?.number ?? '';
    const display = `${regionCode} ${series} ${number}`.trim();
    const normalized = display.replace(/\s+/g, '').toUpperCase();

    if (normalized && normalized !== before.plateDetails?.plateNormalized) {
      await this.assertNoDuplicateActive(normalized, id);
    }

    const updated = await this.plates.updateWithDetails(id, {
      listing: {
        cityId: input.cityId,
        primaryPrice: input.primaryPrice,
        status: input.status,
        updatedById: actor.id,
      },
      plateDetails: before.plateDetails
        ? {
            format: {
              connect: {
                code: input.formatCode ?? before.plateDetails.formatCode,
              },
            },
            plateDisplay: display || before.plateDetails.plateDisplay,
            plateNormalized: normalized || before.plateDetails.plateNormalized,
            series: series || before.plateDetails.series,
            number: number || before.plateDetails.number,
            regionCode: regionCode || before.plateDetails.regionCode,
            plateType: input.plateType ?? before.plateDetails.plateType,
            ...(input.plateCategoryId
              ? { plateCategory: { connect: { id: input.plateCategoryId } } }
              : {}),
            ...(input.platePrefixId
              ? { platePrefix: { connect: { id: input.platePrefixId } } }
              : {}),
          }
        : undefined,
      translation: before.translations[0]
        ? {
            language: before.translations[0].language,
            title: input.title ?? before.translations[0].title,
            description: input.description ?? before.translations[0].description,
            updatedById: actor.id,
          }
        : undefined,
    });

    await this.audit.log({
      actorId: actor.id,
      action: 'plate.update',
      module: 'plates',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });

    return updated;
  }

  async remove(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    const updated = await this.plates.softDelete(id, actor.id);
    await this.audit.log({
      actorId: actor.id,
      action: 'plate.delete',
      module: 'plates',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }

  private async assertNoDuplicateActive(normalized: string, excludeListingId?: string) {
    const existing = await this.plates.findDuplicateNormalized(normalized, excludeListingId);
    if (existing) {
      throw new ConflictException('An active listing already uses this plate');
    }
  }
}
