import { Injectable } from '@nestjs/common';
import { Prisma } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export type AuditWriteInput = {
  actorId?: string | null;
  action: string;
  module: string;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  before?: unknown;
  after?: unknown;
};

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditWriteInput) {
    return this.prisma.adminAuditLog.create({
      data: {
        actorId: input.actorId ?? undefined,
        action: input.action,
        module: input.module,
        entityId: input.entityId ?? undefined,
        ip: input.ip ?? undefined,
        userAgent: input.userAgent ?? undefined,
        before:
          input.before === undefined
            ? undefined
            : (input.before as Prisma.InputJsonValue),
        after:
          input.after === undefined
            ? undefined
            : (input.after as Prisma.InputJsonValue),
      },
    });
  }
}
