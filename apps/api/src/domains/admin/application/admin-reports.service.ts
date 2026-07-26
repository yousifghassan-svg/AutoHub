import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ListingStatus,
  Prisma,
  ReportReason,
  ReportStatus,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  async create(
    input: { listingId: string; reason: ReportReason; details?: string },
    reporter: AuthenticatedUser,
  ) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: input.listingId, deletedAt: null },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    return this.prisma.listingReport.create({
      data: {
        listingId: input.listingId,
        reporterId: reporter.id,
        reason: input.reason,
        details: input.details,
      },
    });
  }

  async list(query: {
    page?: number;
    pageSize?: number;
    status?: ReportStatus;
    domain?: 'VEHICLE' | 'PLATE';
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where: Prisma.ListingReportWhereInput = {
      deletedAt: null,
      status: query.status,
      ...(query.domain
        ? { listing: { domain: query.domain, deletedAt: null } }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.listingReport.count({ where }),
      this.prisma.listingReport.findMany({
        where,
        include: {
          listing: {
            include: {
              translations: true,
              seller: { select: { id: true, displayName: true, phone: true } },
            },
          },
          reporter: { select: { id: true, displayName: true, phone: true } },
          resolvedBy: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        listing: item.listing
          ? {
              ...item.listing,
              title:
                item.listing.translations?.[0]?.title ??
                item.listing.slug ??
                item.listing.id,
            }
          : null,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
    };
  }

  async resolve(
    id: string,
    resolution: string | undefined,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    return this.close(id, ReportStatus.RESOLVED, resolution, actor, 'report.resolve', ctx);
  }

  async reject(
    id: string,
    resolution: string | undefined,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    return this.close(id, ReportStatus.REJECTED, resolution, actor, 'report.reject', ctx);
  }

  async banListing(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const report = await this.prisma.listingReport.findFirst({
      where: { id, deletedAt: null },
    });
    if (!report) throw new NotFoundException('Report not found');

    const [listing, updatedReport] = await this.prisma.$transaction([
      this.prisma.listing.update({
        where: { id: report.listingId },
        data: {
          status: ListingStatus.ARCHIVED,
          updatedById: actor.id,
        },
      }),
      this.prisma.listingReport.update({
        where: { id },
        data: {
          status: ReportStatus.RESOLVED,
          resolution: 'Listing banned',
          resolvedById: actor.id,
          resolvedAt: new Date(),
        },
      }),
    ]);

    await this.audit.log({
      actorId: actor.id,
      action: 'report.ban_listing',
      module: 'reports',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      after: { listing, report: updatedReport },
    });

    return updatedReport;
  }

  private async close(
    id: string,
    status: ReportStatus,
    resolution: string | undefined,
    actor: AuthenticatedUser,
    action: string,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.prisma.listingReport.findFirst({
      where: { id, deletedAt: null },
    });
    if (!before) throw new NotFoundException('Report not found');
    if (before.status !== ReportStatus.OPEN) {
      throw new BadRequestException('Report is already closed');
    }

    const updated = await this.prisma.listingReport.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedById: actor.id,
        resolvedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId: actor.id,
      action,
      module: 'reports',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }
}
