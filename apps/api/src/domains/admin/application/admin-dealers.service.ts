import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus, Prisma } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';

@Injectable()
export class AdminDealersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  async list(query: { page?: number; pageSize?: number; q?: string; verified?: boolean }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where: Prisma.DealerOrganizationWhereInput = {
      deletedAt: null,
      verified: query.verified,
      OR: query.q?.trim()
        ? [
            { name: { contains: query.q.trim(), mode: 'insensitive' } },
            { slug: { contains: query.q.trim(), mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [total, items] = await Promise.all([
      this.prisma.dealerOrganization.count({ where }),
      this.prisma.dealerOrganization.findMany({
        where,
        include: {
          city: true,
          members: {
            where: { deletedAt: null },
            include: { user: { select: { id: true, displayName: true, phone: true, role: true } } },
          },
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
    const dealer = await this.prisma.dealerOrganization.findFirst({
      where: { id, deletedAt: null },
      include: {
        city: true,
        members: {
          where: { deletedAt: null },
          include: { user: true },
        },
      },
    });
    if (!dealer) throw new NotFoundException('Dealer not found');

    const memberIds = dealer.members.map((m) => m.userId);
    const [cars, sold, views] = await Promise.all([
      this.prisma.listing.count({
        where: {
          deletedAt: null,
          sellerId: { in: memberIds },
          categoryCode: 'CAR',
        },
      }),
      this.prisma.listing.count({
        where: {
          deletedAt: null,
          sellerId: { in: memberIds },
          status: ListingStatus.SOLD,
        },
      }),
      this.prisma.listing.aggregate({
        where: { deletedAt: null, sellerId: { in: memberIds } },
        _sum: { viewsCount: true },
      }),
    ]);

    return {
      ...dealer,
      statistics: {
        cars,
        sold,
        followers: dealer.followersCount,
        views: views._sum.viewsCount ?? dealer.viewsCount,
      },
    };
  }

  async create(
    input: {
      name: string;
      slug: string;
      verified?: boolean;
      bio?: string;
      phone?: string;
      whatsapp?: string;
      address?: string;
      coverImageUrl?: string;
      logoUrl?: string;
      openingHours?: string;
      cityId?: string;
      ownerUserId?: string;
    },
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const existing = await this.prisma.dealerOrganization.findUnique({
      where: { slug: input.slug },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException('Dealer slug already exists');
    }

    const created = await this.prisma.dealerOrganization.create({
      data: {
        name: input.name,
        slug: input.slug,
        verified: input.verified ?? false,
        bio: input.bio,
        phone: input.phone,
        whatsapp: input.whatsapp,
        address: input.address,
        coverImageUrl: input.coverImageUrl,
        logoUrl: input.logoUrl,
        openingHours: input.openingHours,
        cityId: input.cityId,
        createdById: actor.id,
        updatedById: actor.id,
        members: input.ownerUserId
          ? {
              create: {
                userId: input.ownerUserId,
                role: 'OWNER',
              },
            }
          : undefined,
      },
      include: { members: true, city: true },
    });

    if (input.ownerUserId) {
      await this.prisma.user.update({
        where: { id: input.ownerUserId },
        data: { role: 'DEALER' },
      });
    }

    await this.audit.log({
      actorId: actor.id,
      action: 'dealer.create',
      module: 'dealers',
      entityId: created.id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      after: created,
    });
    return created;
  }

  async update(
    id: string,
    input: {
      name?: string;
      verified?: boolean;
      bio?: string;
      phone?: string;
      whatsapp?: string;
      address?: string;
      coverImageUrl?: string;
      logoUrl?: string;
      openingHours?: string;
      cityId?: string | null;
      followersCount?: number;
      viewsCount?: number;
    },
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    const updated = await this.prisma.dealerOrganization.update({
      where: { id },
      data: {
        name: input.name,
        verified: input.verified,
        bio: input.bio,
        phone: input.phone,
        whatsapp: input.whatsapp,
        address: input.address,
        coverImageUrl: input.coverImageUrl,
        logoUrl: input.logoUrl,
        openingHours: input.openingHours,
        cityId: input.cityId === undefined ? undefined : input.cityId,
        followersCount: input.followersCount,
        viewsCount: input.viewsCount,
        updatedById: actor.id,
      },
      include: { members: true, city: true },
    });
    await this.audit.log({
      actorId: actor.id,
      action: 'dealer.update',
      module: 'dealers',
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
    const updated = await this.prisma.dealerOrganization.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: actor.id },
    });
    await this.audit.log({
      actorId: actor.id,
      action: 'dealer.delete',
      module: 'dealers',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }
}
