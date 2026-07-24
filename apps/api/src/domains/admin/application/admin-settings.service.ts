import { Injectable } from '@nestjs/common';
import { Prisma } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';

@Injectable()
export class AdminSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  async get() {
    return this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        siteName: 'AutoHub',
        maintenanceMode: false,
        featuredLimit: 12,
        maxImages: 20,
        defaultCurrency: 'IQD',
        contactInfo: {},
        socialLinks: {},
      },
    });
  }

  async update(
    input: {
      siteName?: string;
      maintenanceMode?: boolean;
      featuredLimit?: number;
      maxImages?: number;
      defaultCurrency?: string;
      contactInfo?: Record<string, unknown>;
      socialLinks?: Record<string, unknown>;
    },
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const before = await this.get();
    const updated = await this.prisma.siteSettings.update({
      where: { id: 'default' },
      data: {
        siteName: input.siteName,
        maintenanceMode: input.maintenanceMode,
        featuredLimit: input.featuredLimit,
        maxImages: input.maxImages,
        defaultCurrency: input.defaultCurrency,
        contactInfo:
          input.contactInfo === undefined
            ? undefined
            : (input.contactInfo as Prisma.InputJsonValue),
        socialLinks:
          input.socialLinks === undefined
            ? undefined
            : (input.socialLinks as Prisma.InputJsonValue),
      },
    });

    await this.audit.log({
      actorId: actor.id,
      action: 'settings.update',
      module: 'settings',
      entityId: 'default',
      ip: ctx?.ip,
      userAgent: ctx?.userAgent,
      before,
      after: updated,
    });

    return updated;
  }
}
