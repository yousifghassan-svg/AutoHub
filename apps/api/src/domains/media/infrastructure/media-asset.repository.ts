import { Injectable } from '@nestjs/common';
import {
  MediaAsset,
  MediaAssetStatus,
  MediaType,
  MediaVariant,
  MediaVariantKind,
  Prisma,
  VirusScanStatus,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

const assetInclude = {
  variants: { where: { deletedAt: null } },
  owner: {
    select: {
      id: true,
      displayName: true,
      email: true,
      phone: true,
    },
  },
} satisfies Prisma.MediaAssetInclude;

export type MediaAssetWithVariants = Prisma.MediaAssetGetPayload<{
  include: typeof assetInclude;
}>;

export type AdminMediaListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  mediaType?: MediaType;
  status?: MediaAssetStatus;
  unused?: boolean;
  duplicates?: boolean;
  ownerId?: string;
  includeDeleted?: boolean;
};

@Injectable()
export class MediaAssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MediaAssetCreateInput): Promise<MediaAssetWithVariants> {
    return this.prisma.mediaAsset.create({
      data,
      include: assetInclude,
    });
  }

  findById(id: string): Promise<MediaAssetWithVariants | null> {
    return this.prisma.mediaAsset.findFirst({
      where: { id, deletedAt: null },
      include: assetInclude,
    });
  }

  /** Includes soft-deleted rows (for restore). */
  findByIdAny(id: string): Promise<MediaAssetWithVariants | null> {
    return this.prisma.mediaAsset.findFirst({
      where: { id },
      include: assetInclude,
    });
  }

  update(
    id: string,
    data: Prisma.MediaAssetUpdateInput,
  ): Promise<MediaAssetWithVariants> {
    return this.prisma.mediaAsset.update({
      where: { id },
      data,
      include: assetInclude,
    });
  }

  softDelete(id: string, updatedById: string): Promise<MediaAsset> {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: MediaAssetStatus.DELETED,
        updatedBy: { connect: { id: updatedById } },
      },
    });
  }

  restore(id: string, updatedById: string): Promise<MediaAssetWithVariants> {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: {
        deletedAt: null,
        status: MediaAssetStatus.READY,
        processingError: null,
        updatedBy: { connect: { id: updatedById } },
      },
      include: assetInclude,
    });
  }

  upsertVariant(input: {
    mediaAssetId: string;
    kind: MediaVariantKind;
    r2Key: string;
    mimeType: string;
    width?: number;
    height?: number;
    byteSize: number;
  }): Promise<MediaVariant> {
    return this.prisma.mediaVariant.upsert({
      where: {
        mediaAssetId_kind: {
          mediaAssetId: input.mediaAssetId,
          kind: input.kind,
        },
      },
      create: input,
      update: {
        r2Key: input.r2Key,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        byteSize: input.byteSize,
        deletedAt: null,
      },
    });
  }

  setVirusStatus(id: string, status: VirusScanStatus): Promise<MediaAsset> {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: { virusScanStatus: status },
    });
  }

  /** Abandoned presigns that never completed. */
  findStalePendingUploads(olderThan: Date, take = 100): Promise<MediaAssetWithVariants[]> {
    return this.prisma.mediaAsset.findMany({
      where: {
        status: MediaAssetStatus.PENDING_UPLOAD,
        deletedAt: null,
        createdAt: { lt: olderThan },
      },
      include: assetInclude,
      take,
    });
  }

  /** Soft-deleted assets still holding R2 keys (for storage reaping). */
  findSoftDeletedForCleanup(olderThan: Date, take = 100): Promise<MediaAssetWithVariants[]> {
    return this.prisma.mediaAsset.findMany({
      where: {
        deletedAt: { not: null, lt: olderThan },
        status: MediaAssetStatus.DELETED,
      },
      include: assetInclude,
      take,
    });
  }

  async listForOwner(
    ownerId: string,
    query: { page: number; pageSize: number; mediaType?: MediaType; status?: MediaAssetStatus },
  ): Promise<{ items: MediaAssetWithVariants[]; total: number }> {
    const where: Prisma.MediaAssetWhereInput = {
      ownerId,
      deletedAt: null,
      ...(query.mediaType ? { mediaType: query.mediaType } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.mediaAsset.count({ where }),
      this.prisma.mediaAsset.findMany({
        where,
        include: assetInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return { items, total };
  }

  async listAdmin(query: AdminMediaListQuery): Promise<{
    items: MediaAssetWithVariants[];
    total: number;
    storageUsage: { totalBytes: number; assetCount: number };
    duplicateChecksums?: string[];
  }> {
    const where: Prisma.MediaAssetWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.mediaType ? { mediaType: query.mediaType } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.ownerId ? { ownerId: query.ownerId } : {}),
      ...(query.unused ? { ownerEntityId: null } : {}),
      ...(query.q
        ? {
            OR: [
              { filename: { contains: query.q, mode: 'insensitive' } },
              { originalKey: { contains: query.q, mode: 'insensitive' } },
              { mimeType: { contains: query.q, mode: 'insensitive' } },
              { id: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    let duplicateChecksums: string[] | undefined;
    if (query.duplicates) {
      const groups = await this.prisma.mediaAsset.groupBy({
        by: ['checksumSha256'],
        where: {
          deletedAt: null,
          checksumSha256: { not: null },
        },
        having: {
          checksumSha256: { _count: { gt: 1 } },
        },
        _count: { checksumSha256: true },
      });
      duplicateChecksums = groups
        .map((g) => g.checksumSha256)
        .filter((c): c is string => Boolean(c));
      where.checksumSha256 = { in: duplicateChecksums.length ? duplicateChecksums : ['__none__'] };
    }

    const [total, items, usage] = await this.prisma.$transaction([
      this.prisma.mediaAsset.count({ where }),
      this.prisma.mediaAsset.findMany({
        where,
        include: assetInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.mediaAsset.aggregate({
        where: { deletedAt: null },
        _sum: { byteSize: true },
        _count: { _all: true },
      }),
    ]);

    return {
      items,
      total,
      storageUsage: {
        totalBytes: usage._sum.byteSize ?? 0,
        assetCount: usage._count._all,
      },
      duplicateChecksums,
    };
  }
}
