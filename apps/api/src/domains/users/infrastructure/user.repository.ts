import { Injectable } from '@nestjs/common';
import type {
  LanguageCode,
  SellerType,
  User,
  UserRole,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { NotificationPreferences } from '../../auth/domain/auth.types';

const userProfileInclude = {
  city: {
    include: {
      governorate: true,
    },
  },
  sellerProfile: true,
  notificationPreference: true,
} as const;

export type UserWithProfile = User & {
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
  sellerProfile: {
    id: string;
    userId: string;
    type: SellerType;
    displayName: string;
    bio: string | null;
  } | null;
  notificationPreference: NotificationPreferences & {
    id: string;
    userId: string;
  } | null;
};

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: userProfileInclude,
    });
  }

  findByFirebaseUid(firebaseUid: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findFirst({
      where: { firebaseUid, deletedAt: null },
      include: userProfileInclude,
    });
  }

  findByPhone(phone: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findFirst({
      where: { phone, deletedAt: null },
      include: userProfileInclude,
    });
  }

  findCityById(cityId: string) {
    return this.prisma.city.findFirst({
      where: { id: cityId, deletedAt: null },
      select: { id: true },
    });
  }

  findOwnedReadyMedia(userId: string, mediaId: string) {
    return this.prisma.mediaAsset.findFirst({
      where: {
        id: mediaId,
        ownerId: userId,
        deletedAt: null,
        status: 'READY',
      },
      select: {
        id: true,
        originalKey: true,
        visibility: true,
        status: true,
        mediaType: true,
      },
    });
  }

  createFromFirebase(input: {
    firebaseUid: string;
    phone: string;
    email?: string | null;
    displayName?: string | null;
    role?: UserRole;
  }): Promise<UserWithProfile> {
    return this.prisma.user.create({
      data: {
        firebaseUid: input.firebaseUid,
        phone: input.phone,
        email: input.email ?? undefined,
        displayName: input.displayName ?? undefined,
        role: input.role ?? 'USER',
      },
      include: userProfileInclude,
    });
  }

  updateIdentity(
    id: string,
    data: { phone?: string; email?: string | null; displayName?: string | null },
  ): Promise<UserWithProfile> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: userProfileInclude,
    });
  }

  updateProfile(
    id: string,
    data: {
      displayName?: string;
      firstName?: string | null;
      lastName?: string | null;
      cityId?: string;
      preferredLanguage?: LanguageCode | null;
      email?: string | null;
      avatarUrl?: string | null;
      avatarMediaId?: string | null;
      dateOfBirth?: Date | null;
      sellerProfile?: {
        type?: SellerType;
        displayName?: string;
        bio?: string | null;
      };
      notificationPreferences?: Partial<NotificationPreferences>;
    },
  ): Promise<UserWithProfile> {
    const {
      sellerProfile,
      notificationPreferences,
      avatarMediaId,
      ...userFields
    } = data;

    return this.prisma.$transaction(async (tx) => {
      if (sellerProfile) {
        const existing = await tx.user.findUnique({
          where: { id },
          select: { displayName: true, sellerProfile: true },
        });
        const fallbackName =
          sellerProfile.displayName?.trim() ||
          existing?.sellerProfile?.displayName ||
          existing?.displayName?.trim() ||
          'Seller';
        await tx.sellerProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            type: sellerProfile.type ?? 'INDIVIDUAL',
            displayName: fallbackName,
            bio: sellerProfile.bio ?? null,
          },
          update: {
            ...(sellerProfile.type !== undefined ? { type: sellerProfile.type } : {}),
            ...(sellerProfile.displayName !== undefined
              ? { displayName: sellerProfile.displayName }
              : {}),
            ...(Object.prototype.hasOwnProperty.call(sellerProfile, 'bio')
              ? { bio: sellerProfile.bio ?? null }
              : {}),
            deletedAt: null,
          },
        });
      }

      if (notificationPreferences) {
        await tx.userNotificationPreference.upsert({
          where: { userId: id },
          create: {
            userId: id,
            ...notificationPreferences,
          },
          update: notificationPreferences,
        });
      }

      return tx.user.update({
        where: { id },
        data: {
          ...userFields,
          ...(avatarMediaId !== undefined
            ? { avatarMediaId: avatarMediaId }
            : {}),
        },
        include: userProfileInclude,
      });
    });
  }

  ensureNotificationPreferences(userId: string): Promise<UserWithProfile> {
    return this.prisma.$transaction(async (tx) => {
      await tx.userNotificationPreference.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
      return tx.user.findFirstOrThrow({
        where: { id: userId, deletedAt: null },
        include: userProfileInclude,
      });
    });
  }
}
