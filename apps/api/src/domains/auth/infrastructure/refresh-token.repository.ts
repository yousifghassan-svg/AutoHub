import { Injectable } from '@nestjs/common';
import type { RefreshToken } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  /**
   * Atomically create the rotated refresh token and revoke the previous one.
   * Prevents a crash window where both tokens remain valid.
   */
  async rotate(input: {
    revokeId: string;
    create: {
      userId: string;
      tokenHash: string;
      familyId: string;
      expiresAt: Date;
      userAgent?: string;
      ipAddress?: string;
    };
  }): Promise<RefreshToken> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({ data: input.create });
      await tx.refreshToken.update({
        where: { id: input.revokeId },
        data: {
          revokedAt: new Date(),
          replacedById: created.id,
        },
      });
      return created;
    });
  }

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash, deletedAt: null },
    });
  }

  async revoke(id: string, replacedById?: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        replacedById,
      },
    });
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null, deletedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null, deletedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
