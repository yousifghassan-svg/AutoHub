import { Injectable } from '@nestjs/common';
import { Prisma } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class AdminAuditQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    q?: string;
    actorId?: string;
    action?: string;
    module?: string;
    entityId?: string;
    from?: string;
    to?: string;
  }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const and: Prisma.AdminAuditLogWhereInput[] = [];

    if (query.actorId) and.push({ actorId: query.actorId });
    if (query.entityId?.trim()) {
      and.push({ entityId: query.entityId.trim() });
    }
    if (query.action?.trim()) {
      and.push({ action: { contains: query.action.trim(), mode: 'insensitive' } });
    }
    if (query.module?.trim()) {
      and.push({ module: { equals: query.module.trim(), mode: 'insensitive' } });
    }
    if (query.from || query.to) {
      and.push({
        createdAt: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
      });
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { action: { contains: q, mode: 'insensitive' } },
          { module: { contains: q, mode: 'insensitive' } },
          { entityId: { contains: q, mode: 'insensitive' } },
          { actor: { displayName: { contains: q, mode: 'insensitive' } } },
          { actor: { phone: { contains: q } } },
          { actor: { email: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    const where: Prisma.AdminAuditLogWhereInput = and.length ? { AND: and } : {};

    const [total, items] = await Promise.all([
      this.prisma.adminAuditLog.count({ where }),
      this.prisma.adminAuditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              displayName: true,
              phone: true,
              email: true,
              role: true,
            },
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
}
