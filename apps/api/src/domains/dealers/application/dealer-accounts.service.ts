import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DealerMemberRole,
  DealerVerificationStatus,
  ListingStatus,
  MediaAssetStatus,
  MediaType,
  MediaVisibility,
  UserRole,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { R2StorageService } from '../../../infrastructure/storage/r2-storage.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';

export type ApplyDealerInput = {
  name: string;
  slug?: string;
  cityId?: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  address?: string;
  openingHours?: string;
  logoMediaId?: string;
  coverMediaId?: string;
};

export type UpdateDealerOrgInput = {
  name?: string;
  bio?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  openingHours?: string | null;
  cityId?: string | null;
  logoMediaId?: string | null;
  coverMediaId?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
};

type MembershipContext = {
  membership: {
    id: string;
    role: DealerMemberRole;
    userId: string;
    organizationId: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    verificationStatus: DealerVerificationStatus;
    verified: boolean;
    rejectionReason: string | null;
    bio: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    openingHours: string | null;
    cityId: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    logoMediaId: string | null;
    coverMediaId: string | null;
    followersCount: number;
    viewsCount: number;
    deletedAt: Date | null;
  };
};

@Injectable()
export class DealerAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2StorageService,
  ) {}

  async apply(userId: string, input: ApplyDealerInput) {
    const name = input.name.trim();
    if (name.length < 2) {
      throw new BadRequestException('name must be at least 2 characters');
    }
    const slug = (input.slug?.trim() || slugify(name)).toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new BadRequestException('Invalid slug');
    }

    const blocking = await this.prisma.dealerMember.findFirst({
      where: {
        userId,
        deletedAt: null,
        role: DealerMemberRole.OWNER,
        organization: {
          deletedAt: null,
          verificationStatus: {
            in: [DealerVerificationStatus.PENDING, DealerVerificationStatus.VERIFIED],
          },
        },
      },
    });
    if (blocking) {
      throw new ConflictException(
        'You already own a pending or verified dealer organization',
      );
    }

    const slugTaken = await this.prisma.dealerOrganization.findFirst({
      where: { slug, deletedAt: null },
    });
    if (slugTaken) {
      throw new ConflictException('Dealer slug already exists');
    }

    if (input.cityId) {
      const city = await this.prisma.city.findFirst({
        where: { id: input.cityId, deletedAt: null },
      });
      if (!city) throw new BadRequestException('Invalid cityId');
    }

    const media = await this.resolveMediaPair(userId, {
      logoMediaId: input.logoMediaId,
      coverMediaId: input.coverMediaId,
    });

    const org = await this.prisma.$transaction(async (tx) => {
      const created = await tx.dealerOrganization.create({
        data: {
          name,
          slug,
          verificationStatus: DealerVerificationStatus.PENDING,
          verified: false,
          bio: input.bio?.trim() || null,
          phone: input.phone?.trim() || null,
          whatsapp: input.whatsapp?.trim() || null,
          address: input.address?.trim() || null,
          openingHours: input.openingHours?.trim() || null,
          cityId: input.cityId ?? null,
          logoMediaId: media.logoMediaId,
          coverMediaId: media.coverMediaId,
          logoUrl: media.logoUrl,
          coverImageUrl: media.coverImageUrl,
          createdById: userId,
          updatedById: userId,
          members: {
            create: {
              userId,
              role: DealerMemberRole.OWNER,
            },
          },
        },
        include: {
          members: { where: { deletedAt: null } },
          city: true,
        },
      });
      return created;
    });

    return this.toMeResponse(org, DealerMemberRole.OWNER);
  }

  async getMe(userId: string) {
    const ctx = await this.requireMembership(userId);
    const org = await this.prisma.dealerOrganization.findFirstOrThrow({
      where: { id: ctx.organization.id },
      include: {
        city: true,
        members: { where: { deletedAt: null } },
      },
    });
    return this.toMeResponse(org, ctx.membership.role);
  }

  async updateMe(userId: string, input: UpdateDealerOrgInput) {
    const ctx = await this.requireMembership(userId, ['OWNER', 'MANAGER']);
    if (input.cityId) {
      const city = await this.prisma.city.findFirst({
        where: { id: input.cityId, deletedAt: null },
      });
      if (!city) throw new BadRequestException('Invalid cityId');
    }

    const media = await this.resolveMediaPair(userId, {
      logoMediaId: input.logoMediaId,
      coverMediaId: input.coverMediaId,
      allowNull: true,
    });

    const updated = await this.prisma.dealerOrganization.update({
      where: { id: ctx.organization.id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(Object.prototype.hasOwnProperty.call(input, 'bio')
          ? { bio: input.bio?.trim() || null }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(input, 'phone')
          ? { phone: input.phone?.trim() || null }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(input, 'whatsapp')
          ? { whatsapp: input.whatsapp?.trim() || null }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(input, 'address')
          ? { address: input.address?.trim() || null }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(input, 'openingHours')
          ? { openingHours: input.openingHours?.trim() || null }
          : {}),
        ...(input.cityId !== undefined ? { cityId: input.cityId } : {}),
        ...(input.logoMediaId !== undefined
          ? {
              logoMediaId: media.logoMediaId,
              logoUrl:
                media.logoUrl ??
                (input.logoUrl !== undefined ? input.logoUrl : undefined),
            }
          : Object.prototype.hasOwnProperty.call(input, 'logoUrl')
            ? { logoUrl: input.logoUrl }
            : {}),
        ...(input.coverMediaId !== undefined
          ? {
              coverMediaId: media.coverMediaId,
              coverImageUrl:
                media.coverImageUrl ??
                (input.coverImageUrl !== undefined ? input.coverImageUrl : undefined),
            }
          : Object.prototype.hasOwnProperty.call(input, 'coverImageUrl')
            ? { coverImageUrl: input.coverImageUrl }
            : {}),
        updatedById: userId,
      },
      include: {
        city: true,
        members: { where: { deletedAt: null } },
      },
    });

    return this.toMeResponse(updated, ctx.membership.role);
  }

  async reapply(userId: string) {
    const ctx = await this.requireMembership(userId, ['OWNER']);
    if (ctx.organization.verificationStatus !== DealerVerificationStatus.REJECTED) {
      throw new BadRequestException('Only rejected applications can reapply');
    }

    const updated = await this.prisma.dealerOrganization.update({
      where: { id: ctx.organization.id },
      data: {
        verificationStatus: DealerVerificationStatus.PENDING,
        verified: false,
        rejectedAt: null,
        rejectionReason: null,
        verifiedAt: null,
        verifiedById: null,
        updatedById: userId,
      },
      include: {
        city: true,
        members: { where: { deletedAt: null } },
      },
    });
    return this.toMeResponse(updated, ctx.membership.role);
  }

  async listMembers(userId: string) {
    const ctx = await this.requireMembership(userId);
    const members = await this.prisma.dealerMember.findMany({
      where: { organizationId: ctx.organization.id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return {
      organizationId: ctx.organization.id,
      items: members.map((m) => ({
        userId: m.userId,
        role: m.role,
        displayName: m.user.displayName,
        phone: m.user.phone,
        userRole: m.user.role,
        avatarUrl: m.user.avatarUrl,
        joinedAt: m.createdAt,
      })),
    };
  }

  async addMember(
    actorId: string,
    input: { userId?: string; phone?: string; role?: DealerMemberRole },
  ) {
    const ctx = await this.requireMembership(actorId, ['OWNER', 'MANAGER']);
    const role = input.role ?? DealerMemberRole.STAFF;
    if (role === DealerMemberRole.OWNER) {
      throw new BadRequestException('Cannot add another OWNER; transfer ownership instead');
    }
    if (ctx.membership.role === DealerMemberRole.MANAGER && role === DealerMemberRole.MANAGER) {
      throw new ForbiddenException('Managers cannot add other managers');
    }

    let targetUserId = input.userId;
    if (!targetUserId && input.phone) {
      const user = await this.prisma.user.findFirst({
        where: { phone: input.phone.trim(), deletedAt: null, status: 'ACTIVE' },
      });
      if (!user) throw new NotFoundException('User not found for phone');
      targetUserId = user.id;
    }
    if (!targetUserId) {
      throw new BadRequestException('userId or phone is required');
    }
    if (targetUserId === actorId) {
      throw new BadRequestException('Cannot add yourself');
    }

    const existing = await this.prisma.dealerMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: ctx.organization.id,
          userId: targetUserId,
        },
      },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException('User is already a member');
    }

    const member = existing
      ? await this.prisma.dealerMember.update({
          where: { id: existing.id },
          data: { deletedAt: null, role, updatedAt: new Date() },
          include: {
            user: {
              select: { id: true, displayName: true, phone: true, role: true, avatarUrl: true },
            },
          },
        })
      : await this.prisma.dealerMember.create({
          data: {
            organizationId: ctx.organization.id,
            userId: targetUserId,
            role,
          },
          include: {
            user: {
              select: { id: true, displayName: true, phone: true, role: true, avatarUrl: true },
            },
          },
        });

    if (
      ctx.organization.verificationStatus === DealerVerificationStatus.VERIFIED &&
      member.user.role === UserRole.USER
    ) {
      await this.prisma.user.update({
        where: { id: targetUserId },
        data: { role: UserRole.DEALER },
      });
    }

    return {
      userId: member.userId,
      role: member.role,
      displayName: member.user.displayName,
      phone: member.user.phone,
      userRole: member.user.role,
      avatarUrl: member.user.avatarUrl,
      joinedAt: member.createdAt,
    };
  }

  async updateMemberRole(
    actorId: string,
    targetUserId: string,
    role: DealerMemberRole,
  ) {
    const ctx = await this.requireMembership(actorId, ['OWNER']);
    if (role === DealerMemberRole.OWNER) {
      throw new BadRequestException('Use ownership transfer to assign OWNER');
    }

    const target = await this.prisma.dealerMember.findFirst({
      where: {
        organizationId: ctx.organization.id,
        userId: targetUserId,
        deletedAt: null,
      },
    });
    if (!target) throw new NotFoundException('Member not found');
    if (target.role === DealerMemberRole.OWNER) {
      throw new BadRequestException('Cannot change OWNER role');
    }

    const updated = await this.prisma.dealerMember.update({
      where: { id: target.id },
      data: { role },
      include: {
        user: {
          select: { id: true, displayName: true, phone: true, role: true, avatarUrl: true },
        },
      },
    });

    return {
      userId: updated.userId,
      role: updated.role,
      displayName: updated.user.displayName,
      phone: updated.user.phone,
      userRole: updated.user.role,
      avatarUrl: updated.user.avatarUrl,
      joinedAt: updated.createdAt,
    };
  }

  async removeMember(actorId: string, targetUserId: string) {
    const ctx = await this.requireMembership(actorId, ['OWNER', 'MANAGER']);
    const target = await this.prisma.dealerMember.findFirst({
      where: {
        organizationId: ctx.organization.id,
        userId: targetUserId,
        deletedAt: null,
      },
    });
    if (!target) throw new NotFoundException('Member not found');
    if (target.role === DealerMemberRole.OWNER) {
      throw new BadRequestException('Cannot remove the OWNER');
    }
    if (
      ctx.membership.role === DealerMemberRole.MANAGER &&
      target.role === DealerMemberRole.MANAGER
    ) {
      throw new ForbiddenException('Managers cannot remove other managers');
    }

    await this.prisma.dealerMember.update({
      where: { id: target.id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async getStats(userId: string) {
    const ctx = await this.requireMembership(userId);
    const memberIds = (
      await this.prisma.dealerMember.findMany({
        where: { organizationId: ctx.organization.id, deletedAt: null },
        select: { userId: true },
      })
    ).map((m) => m.userId);

    const [activeListings, sold, members] = await Promise.all([
      this.prisma.listing.count({
        where: {
          deletedAt: null,
          sellerId: { in: memberIds },
          status: ListingStatus.ACTIVE,
        },
      }),
      this.prisma.listing.count({
        where: {
          deletedAt: null,
          sellerId: { in: memberIds },
          status: ListingStatus.SOLD,
        },
      }),
      this.prisma.dealerMember.count({
        where: { organizationId: ctx.organization.id, deletedAt: null },
      }),
    ]);

    return {
      organizationId: ctx.organization.id,
      activeListings,
      sold,
      followers: ctx.organization.followersCount,
      views: ctx.organization.viewsCount,
      members,
      verificationStatus: ctx.organization.verificationStatus,
      verified: ctx.organization.verificationStatus === DealerVerificationStatus.VERIFIED,
    };
  }

  async getInventory(
    userId: string,
    query: { page?: number; pageSize?: number; includeDrafts?: boolean },
  ) {
    const ctx = await this.requireMembership(userId);
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const memberIds = (
      await this.prisma.dealerMember.findMany({
        where: { organizationId: ctx.organization.id, deletedAt: null },
        select: { userId: true },
      })
    ).map((m) => m.userId);

    const statuses: ListingStatus[] = query.includeDrafts
      ? [ListingStatus.ACTIVE, ListingStatus.DRAFT, ListingStatus.PENDING]
      : [ListingStatus.ACTIVE];

    const where = {
      deletedAt: null,
      sellerId: { in: memberIds },
      status: { in: statuses },
    };

    const [total, items] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          status: true,
          categoryCode: true,
          domain: true,
          primaryPrice: true,
          primaryCurrencyId: true,
          sellerId: true,
          createdAt: true,
          updatedAt: true,
          translations: {
            where: { deletedAt: null },
            take: 1,
            select: { title: true, language: true },
          },
        },
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

  async approve(orgId: string, actor: AuthenticatedUser) {
    const org = await this.prisma.dealerOrganization.findFirst({
      where: { id: orgId, deletedAt: null },
      include: { members: { where: { deletedAt: null } } },
    });
    if (!org) throw new NotFoundException('Dealer not found');
    if (org.verificationStatus !== DealerVerificationStatus.PENDING) {
      throw new BadRequestException('Only PENDING applications can be approved');
    }

    const owner = org.members.find((m) => m.role === DealerMemberRole.OWNER);
    const memberIds = org.members.map((m) => m.userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.dealerOrganization.update({
        where: { id: orgId },
        data: {
          verificationStatus: DealerVerificationStatus.VERIFIED,
          verified: true,
          verifiedAt: new Date(),
          verifiedById: actor.id,
          rejectedAt: null,
          rejectionReason: null,
          updatedById: actor.id,
        },
      });

      if (memberIds.length) {
        await tx.user.updateMany({
          where: {
            id: { in: memberIds },
            role: UserRole.USER,
          },
          data: { role: UserRole.DEALER, updatedById: actor.id },
        });
      }

      if (owner) {
        const user = await tx.user.findUnique({ where: { id: owner.userId } });
        const displayName = user?.displayName?.trim() || org.name;
        await tx.sellerProfile.upsert({
          where: { userId: owner.userId },
          create: {
            userId: owner.userId,
            type: 'DEALER',
            displayName,
          },
          update: { type: 'DEALER', displayName },
        });
      }
    });

    return this.prisma.dealerOrganization.findFirstOrThrow({
      where: { id: orgId },
      include: {
        city: true,
        members: {
          where: { deletedAt: null },
          include: {
            user: { select: { id: true, displayName: true, phone: true, role: true } },
          },
        },
      },
    });
  }

  async reject(orgId: string, actor: AuthenticatedUser, reason: string) {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      throw new BadRequestException('rejection reason is required');
    }

    const org = await this.prisma.dealerOrganization.findFirst({
      where: { id: orgId, deletedAt: null },
    });
    if (!org) throw new NotFoundException('Dealer not found');
    if (org.verificationStatus !== DealerVerificationStatus.PENDING) {
      throw new BadRequestException('Only PENDING applications can be rejected');
    }

    return this.prisma.dealerOrganization.update({
      where: { id: orgId },
      data: {
        verificationStatus: DealerVerificationStatus.REJECTED,
        verified: false,
        rejectedAt: new Date(),
        rejectionReason: trimmed,
        verifiedAt: null,
        verifiedById: null,
        updatedById: actor.id,
      },
      include: {
        city: true,
        members: {
          where: { deletedAt: null },
          include: {
            user: { select: { id: true, displayName: true, phone: true, role: true } },
          },
        },
      },
    });
  }

  private async requireMembership(
    userId: string,
    roles?: Array<'OWNER' | 'MANAGER' | 'STAFF'>,
  ): Promise<MembershipContext> {
    const membership = await this.prisma.dealerMember.findFirst({
      where: {
        userId,
        deletedAt: null,
        organization: { deletedAt: null },
      },
      include: { organization: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) {
      throw new NotFoundException('No dealer organization membership found');
    }
    if (roles && !roles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient organization role');
    }
    return {
      membership: {
        id: membership.id,
        role: membership.role,
        userId: membership.userId,
        organizationId: membership.organizationId,
      },
      organization: membership.organization,
    };
  }

  private async resolveMediaPair(
    userId: string,
    input: {
      logoMediaId?: string | null;
      coverMediaId?: string | null;
      allowNull?: boolean;
    },
  ) {
    let logoMediaId: string | null | undefined = undefined;
    let coverMediaId: string | null | undefined = undefined;
    let logoUrl: string | null | undefined = undefined;
    let coverImageUrl: string | null | undefined = undefined;

    if (Object.prototype.hasOwnProperty.call(input, 'logoMediaId')) {
      if (input.logoMediaId === null) {
        logoMediaId = null;
        logoUrl = null;
      } else if (input.logoMediaId) {
        const resolved = await this.resolveOwnedImage(userId, input.logoMediaId);
        logoMediaId = resolved.id;
        logoUrl = resolved.url;
      }
    }

    if (Object.prototype.hasOwnProperty.call(input, 'coverMediaId')) {
      if (input.coverMediaId === null) {
        coverMediaId = null;
        coverImageUrl = null;
      } else if (input.coverMediaId) {
        const resolved = await this.resolveOwnedImage(userId, input.coverMediaId);
        coverMediaId = resolved.id;
        coverImageUrl = resolved.url;
      }
    }

    return { logoMediaId, coverMediaId, logoUrl, coverImageUrl };
  }

  private async resolveOwnedImage(userId: string, mediaId: string) {
    const media = await this.prisma.mediaAsset.findFirst({
      where: {
        id: mediaId,
        ownerId: userId,
        deletedAt: null,
        status: MediaAssetStatus.READY,
        mediaType: MediaType.IMAGE,
      },
    });
    if (!media) {
      throw new BadRequestException(
        'Media must be a READY IMAGE asset you own',
      );
    }
    let url: string | null = null;
    if (this.r2.isConfigured()) {
      url =
        media.visibility === MediaVisibility.PUBLIC
          ? this.r2.getPublicUrl(media.originalKey)
          : await this.r2.createPresignedDownloadUrl({ key: media.originalKey });
    }
    return { id: media.id, url };
  }

  private toMeResponse(
    org: {
      id: string;
      name: string;
      slug: string;
      verificationStatus: DealerVerificationStatus;
      verified: boolean;
      verifiedAt: Date | null;
      rejectedAt: Date | null;
      rejectionReason: string | null;
      bio: string | null;
      phone: string | null;
      whatsapp: string | null;
      address: string | null;
      openingHours: string | null;
      cityId: string | null;
      logoUrl: string | null;
      coverImageUrl: string | null;
      logoMediaId: string | null;
      coverMediaId: string | null;
      followersCount: number;
      viewsCount: number;
      city?: unknown;
      members?: unknown[];
    },
    role: DealerMemberRole,
  ) {
    return {
      membershipRole: role,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        verificationStatus: org.verificationStatus,
        verified: org.verificationStatus === DealerVerificationStatus.VERIFIED,
        verifiedAt: org.verifiedAt,
        rejectedAt: org.rejectedAt,
        rejectionReason: org.rejectionReason,
        bio: org.bio,
        phone: org.phone,
        whatsapp: org.whatsapp,
        address: org.address,
        openingHours: org.openingHours,
        cityId: org.cityId,
        city: org.city ?? null,
        logoUrl: org.logoUrl,
        coverImageUrl: org.coverImageUrl,
        logoMediaId: org.logoMediaId,
        coverMediaId: org.coverMediaId,
        followersCount: org.followersCount,
        viewsCount: org.viewsCount,
        memberCount: Array.isArray(org.members) ? org.members.length : undefined,
      },
    };
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
