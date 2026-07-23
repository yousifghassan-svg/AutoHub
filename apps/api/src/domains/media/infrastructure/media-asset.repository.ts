import { Injectable } from '@nestjs/common';
import {
  MediaAsset,
  MediaAssetStatus,
  MediaVariant,
  MediaVariantKind,
  Prisma,
  VirusScanStatus,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

const assetInclude = {
  variants: { where: { deletedAt: null } },
} satisfies Prisma.MediaAssetInclude;

export type MediaAssetWithVariants = Prisma.MediaAssetGetPayload<{
  include: typeof assetInclude;
}>;

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
}
