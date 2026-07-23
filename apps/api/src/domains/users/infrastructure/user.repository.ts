import { Injectable } from '@nestjs/common';
import type { User, UserRole } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { firebaseUid, deletedAt: null },
    });
  }

  createFromFirebase(input: {
    firebaseUid: string;
    phone: string;
    email?: string | null;
    displayName?: string | null;
    role?: UserRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        firebaseUid: input.firebaseUid,
        phone: input.phone,
        email: input.email ?? undefined,
        displayName: input.displayName ?? undefined,
        role: input.role ?? 'USER',
      },
    });
  }

  updateIdentity(
    id: string,
    data: { phone?: string; email?: string | null; displayName?: string | null },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
