import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    q?: string;
    role?: UserRole;
    status?: UserStatus;
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: query.role,
      status: query.status,
      OR: query.q?.trim()
        ? [
            { displayName: { contains: query.q.trim(), mode: 'insensitive' } },
            { phone: { contains: query.q.trim() } },
            { email: { contains: query.q.trim(), mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: {
          city: true,
          sellerProfile: true,
          dealerMemberships: {
            where: { deletedAt: null },
            include: { organization: true },
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
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        city: true,
        sellerProfile: true,
        dealerMemberships: {
          where: { deletedAt: null },
          include: { organization: true },
        },
        _count: { select: { listings: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: string,
    input: {
      displayName?: string;
      email?: string | null;
      role?: UserRole;
      preferredLanguage?: 'ar' | 'ku' | 'en';
      cityId?: string | null;
    },
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    if (before.role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('Only SuperAdmin can modify SuperAdmin users');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        displayName: input.displayName,
        email: input.email === undefined ? undefined : input.email,
        role: input.role,
        preferredLanguage: input.preferredLanguage,
        cityId: input.cityId === undefined ? undefined : input.cityId,
        updatedById: actor.id,
      },
      include: { city: true, sellerProfile: true },
    });

    await this.audit.log({
      actorId: actor.id,
      action: 'user.update',
      module: 'users',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }

  async softDelete(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    if (before.id === actor.id) {
      throw new BadRequestException('Cannot delete your own account');
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.DELETED,
        deletedAt: new Date(),
        updatedById: actor.id,
      },
    });
    await this.audit.log({
      actorId: actor.id,
      action: 'user.delete',
      module: 'users',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }

  async suspend(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    return this.setStatus(id, UserStatus.SUSPENDED, actor, 'user.suspend', ctx);
  }

  async activate(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    return this.setStatus(id, UserStatus.ACTIVE, actor, 'user.activate', ctx);
  }

  async verifyDealer(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    const membership = before.dealerMemberships[0];
    if (!membership) {
      throw new BadRequestException('User is not a dealer organization member');
    }

    const displayName =
      before.displayName ??
      membership.organization?.name ??
      orgName(before);

    const [user, org] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { role: UserRole.DEALER, updatedById: actor.id },
      }),
      this.prisma.dealerOrganization.update({
        where: { id: membership.organizationId },
        data: {
          verified: true,
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          verifiedById: actor.id,
          rejectedAt: null,
          rejectionReason: null,
          updatedById: actor.id,
        },
      }),
      this.prisma.sellerProfile.upsert({
        where: { userId: id },
        update: { type: 'DEALER', displayName },
        create: {
          userId: id,
          type: 'DEALER',
          displayName,
        },
      }),
    ]);

    await this.audit.log({
      actorId: actor.id,
      action: 'user.verify_dealer',
      module: 'users',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: { user, organization: org },
    });

    return this.findById(id);
  }

  private async setStatus(
    id: string,
    status: UserStatus,
    actor: AuthenticatedUser,
    action: string,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.findById(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status, updatedById: actor.id },
    });
    await this.audit.log({
      actorId: actor.id,
      action,
      module: 'users',
      entityId: id,
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });
    return updated;
  }
}

function orgName(user: { displayName: string | null; phone: string | null }) {
  return user.displayName ?? user.phone ?? 'Dealer';
}
