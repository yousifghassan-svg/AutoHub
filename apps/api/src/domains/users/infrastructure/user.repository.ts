import { Injectable } from '@nestjs/common';
import type { LanguageCode, User, UserRole } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

const userProfileInclude = {
  city: {
    include: {
      governorate: true,
    },
  },
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
      cityId?: string;
      preferredLanguage?: LanguageCode | null;
      email?: string | null;
      avatarUrl?: string | null;
      dateOfBirth?: Date | null;
    },
  ): Promise<UserWithProfile> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: userProfileInclude,
    });
  }
}
