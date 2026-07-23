import { Injectable } from '@nestjs/common';
import { AuthAuditAction, AuthAuditLog, Prisma } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class AuthAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: {
    userId?: string;
    action: AuthAuditAction;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<AuthAuditLog> {
    return this.prisma.authAuditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: input.metadata,
      },
    });
  }
}
