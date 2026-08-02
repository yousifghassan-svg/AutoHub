import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SellerType } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export type SellerProfileView = {
  userId: string;
  type: SellerType;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  city: {
    id: string;
    nameEn: string;
    nameAr: string;
    nameKu: string | null;
    governorateId: string;
  } | null;
  governorate: {
    id: string;
    nameEn: string;
    nameAr: string;
    nameKu: string | null;
  } | null;
};

export type UpdateSellerProfileInput = {
  type?: SellerType;
  displayName?: string;
  bio?: string | null;
};

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string): Promise<SellerProfileView> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, status: 'ACTIVE' },
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            nameKu: true,
            governorateId: true,
            governorate: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
                nameKu: true,
              },
            },
          },
        },
        sellerProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    let profile = user.sellerProfile;
    if (!profile || profile.deletedAt) {
      profile = await this.prisma.sellerProfile.upsert({
        where: { userId },
        create: {
          userId,
          type: 'INDIVIDUAL',
          displayName: user.displayName?.trim() || 'Seller',
          bio: null,
        },
        update: { deletedAt: null },
      });
    }

    return this.toView(user, profile);
  }

  async updateMine(
    userId: string,
    input: UpdateSellerProfileInput,
  ): Promise<SellerProfileView> {
    if (input.type === 'DEALER') {
      throw new BadRequestException(
        'Dealer status is granted through dealer organization verification. Use POST /v1/dealers/applications',
      );
    }
    if (input.displayName !== undefined) {
      const trimmed = input.displayName.trim();
      if (trimmed.length < 2 || trimmed.length > 80) {
        throw new BadRequestException('displayName must be between 2 and 80 characters');
      }
      input.displayName = trimmed;
    }
    if (input.bio !== undefined && input.bio !== null && input.bio.length > 2000) {
      throw new BadRequestException('bio must be at most 2000 characters');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, status: 'ACTIVE' },
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            nameKu: true,
            governorateId: true,
            governorate: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
                nameKu: true,
              },
            },
          },
        },
        sellerProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const profile = await this.prisma.sellerProfile.upsert({
      where: { userId },
      create: {
        userId,
        type: input.type ?? 'INDIVIDUAL',
        displayName:
          input.displayName ?? user.displayName?.trim() ?? 'Seller',
        bio: input.bio ?? null,
      },
      update: {
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.displayName !== undefined
          ? { displayName: input.displayName }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(input, 'bio')
          ? { bio: input.bio ?? null }
          : {}),
        deletedAt: null,
      },
    });

    return this.toView(user, profile);
  }

  async getPublicByUserId(userId: string): Promise<SellerProfileView> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, status: 'ACTIVE' },
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            nameKu: true,
            governorateId: true,
            governorate: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
                nameKu: true,
              },
            },
          },
        },
        sellerProfile: true,
      },
    });
    if (!user?.sellerProfile || user.sellerProfile.deletedAt) {
      throw new NotFoundException('Seller profile not found');
    }
    return this.toView(user, user.sellerProfile);
  }

  private toView(
    user: {
      id: string;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
      city: {
        id: string;
        nameEn: string;
        nameAr: string;
        nameKu: string | null;
        governorateId: string;
        governorate: {
          id: string;
          nameEn: string;
          nameAr: string;
          nameKu: string | null;
        } | null;
      } | null;
    },
    profile: {
      type: SellerType;
      displayName: string;
      bio: string | null;
    },
  ): SellerProfileView {
    return {
      userId: user.id,
      type: profile.type,
      displayName: profile.displayName || user.displayName || 'Seller',
      bio: profile.bio,
      avatarUrl: user.avatarUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city
        ? {
            id: user.city.id,
            nameEn: user.city.nameEn,
            nameAr: user.city.nameAr,
            nameKu: user.city.nameKu,
            governorateId: user.city.governorateId,
          }
        : null,
      governorate: user.city?.governorate
        ? {
            id: user.city.governorate.id,
            nameEn: user.city.governorate.nameEn,
            nameAr: user.city.governorate.nameAr,
            nameKu: user.city.governorate.nameKu,
          }
        : null,
    };
  }
}
