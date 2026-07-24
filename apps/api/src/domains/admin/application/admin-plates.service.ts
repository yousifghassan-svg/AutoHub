import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ListingCategoryCode,
  ListingStatus,
  Prisma,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';

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
  status?: ListingStatus;
};

@Injectable()
export class AdminPlatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  async list(query: AdminPlatesQuery) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where = this.buildWhere(query);

    const [total, items] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: {
          plateDetails: { include: { format: true } },
          translations: true,
          city: true,
          seller: { select: { id: true, displayName: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
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

  async findById(id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: {
        id,
        deletedAt: null,
        categoryCode: ListingCategoryCode.PLATE,
      },
      include: {
        plateDetails: { include: { format: true } },
        translations: true,
        media: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        city: true,
        seller: true,
      },
    });
    if (!listing) throw new NotFoundException('Plate listing not found');
    return listing;
  }

  async create(
    input: UpsertPlateInput,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const display = `${input.regionCode.trim()} ${input.series.trim().toUpperCase()} ${input.number.trim()}`;
    const normalized = display.replace(/\s+/g, '').toUpperCase();
    await this.assertNoDuplicateActive(normalized);

    const format = await this.prisma.plateFormat.findUnique({
      where: { code: input.formatCode },
    });
    if (!format) throw new BadRequestException('Unknown plate format');

    const country =
      input.countryId ??
      (
        await this.prisma.city.findUniqueOrThrow({
          where: { id: input.cityId },
          include: { governorate: true },
        })
      ).governorate.countryId;

    const slug = `plate-${normalized.toLowerCase()}-${Date.now().toString(36)}`;

    const created = await this.prisma.listing.create({
      data: {
        sellerId: input.sellerId,
        categoryId: input.categoryId,
        categoryCode: ListingCategoryCode.PLATE,
        status: input.status ?? ListingStatus.ACTIVE,
        countryId: country,
        cityId: input.cityId,
        primaryPrice: input.primaryPrice,
        slug,
        metaTitle: input.title,
        publishedAt: new Date(),
        createdById: actor.id,
        updatedById: actor.id,
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
            formatCode: input.formatCode,
            plateDisplay: display,
            plateNormalized: normalized,
            series: input.series.trim().toUpperCase(),
            number: input.number.trim(),
            regionCode: input.regionCode.trim(),
            plateType: input.plateType,
          },
        },
      },
      include: { plateDetails: true, translations: true },
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

    const updated = await this.prisma.$transaction(async (tx) => {
      if (before.plateDetails) {
        await tx.plateDetails.update({
          where: { listingId: id },
          data: {
            formatCode: input.formatCode ?? before.plateDetails.formatCode,
            plateDisplay: display || before.plateDetails.plateDisplay,
            plateNormalized: normalized || before.plateDetails.plateNormalized,
            series: series || before.plateDetails.series,
            number: number || before.plateDetails.number,
            regionCode: regionCode || before.plateDetails.regionCode,
            plateType: input.plateType ?? before.plateDetails.plateType,
          },
        });
      }

      const translation = before.translations[0];
      if (translation && (input.title || input.description)) {
        await tx.listingTranslation.update({
          where: {
            listingId_language: {
              listingId: id,
              language: translation.language,
            },
          },
          data: {
            title: input.title ?? translation.title,
            description: input.description ?? translation.description,
            updatedById: actor.id,
          },
        });
      }

      return tx.listing.update({
        where: { id },
        data: {
          cityId: input.cityId,
          primaryPrice: input.primaryPrice,
          status: input.status,
          updatedById: actor.id,
        },
        include: { plateDetails: true, translations: true },
      });
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
    const updated = await this.prisma.listing.update({
      where: { id },
      data: { deletedAt: new Date(), status: ListingStatus.ARCHIVED, updatedById: actor.id },
      include: { plateDetails: true },
    });
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
    const existing = await this.prisma.plateDetails.findFirst({
      where: {
        plateNormalized: normalized,
        listingId: excludeListingId ? { not: excludeListingId } : undefined,
        listing: {
          deletedAt: null,
          status: ListingStatus.ACTIVE,
          categoryCode: ListingCategoryCode.PLATE,
        },
      },
    });
    if (existing) {
      throw new ConflictException('An active listing already uses this plate');
    }
  }

  private buildWhere(query: AdminPlatesQuery): Prisma.ListingWhereInput {
    const plateFilter: Prisma.PlateDetailsWhereInput = {};
    if (query.formatCode) plateFilter.formatCode = query.formatCode;
    if (query.code) plateFilter.regionCode = { equals: query.code.trim(), mode: 'insensitive' };
    if (query.letter) plateFilter.series = { equals: query.letter.trim().toUpperCase() };
    if (query.number) plateFilter.number = { contains: query.number.trim() };
    if (query.plateType) plateFilter.plateType = { equals: query.plateType, mode: 'insensitive' };
    if (query.governorate) {
      plateFilter.format = {
        is: {
          OR: [
            { nameEn: { contains: query.governorate, mode: 'insensitive' } },
            { nameAr: { contains: query.governorate, mode: 'insensitive' } },
            { code: { contains: query.governorate.toUpperCase() } },
          ],
        },
      };
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      plateFilter.OR = [
        { plateDisplay: { contains: q, mode: 'insensitive' } },
        { plateNormalized: { contains: q.replace(/\s+/g, '').toUpperCase() } },
      ];
    }

    return {
      deletedAt: null,
      categoryCode: ListingCategoryCode.PLATE,
      plateDetails: { is: plateFilter },
    };
  }
}
