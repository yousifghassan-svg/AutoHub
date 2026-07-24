import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  MediaAssetStatus,
  MediaType,
  MediaVariantKind,
  MediaVisibility,
  VirusScanStatus,
} from '@autohub/database';
import { createHash, randomUUID } from 'crypto';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { R2StorageService } from '../../../infrastructure/storage/r2-storage.service';
import { MediaValidationService } from './media-validation.service';
import {
  MediaAssetRepository,
  type MediaAssetWithVariants,
} from '../infrastructure/media-asset.repository';
import { ImageProcessingService } from '../infrastructure/image-processing.service';
import { VideoProcessingService } from '../infrastructure/video-processing.service';
import {
  VIRUS_SCANNER,
  isMediaAdmin,
  MEDIA_SOFT_DELETE_RETENTION_HOURS,
  DOCUMENT_PURPOSES,
  type VirusScanner,
  type DocumentPurpose,
} from '../domain/media.policies';

@Injectable()
export class MediaService {
  constructor(
    private readonly assets: MediaAssetRepository,
    private readonly validation: MediaValidationService,
    private readonly r2: R2StorageService,
    private readonly images: ImageProcessingService,
    private readonly videos: VideoProcessingService,
    @Inject(VIRUS_SCANNER) private readonly virusScanner: VirusScanner,
  ) {}

  /**
   * Creates a pending media asset and returns a signed PUT URL for direct-to-R2 upload.
   */
  async presign(
    actor: AuthenticatedUser,
    input: {
      mediaType: string;
      mimeType: string;
      byteSize: number;
      filename?: string;
      visibility?: MediaVisibility;
      ownerModule?: string;
      ownerEntityId?: string;
      documentPurpose?: string;
    },
  ) {
    const mediaType = this.validation.assertMediaType(input.mediaType);
    this.validation.assertMimeAndSize(mediaType, input.mimeType, input.byteSize);
    const documentPurpose = this.parseDocumentPurpose(mediaType, input.documentPurpose);

    const assetId = randomUUID().replace(/-/g, '').slice(0, 24);
    const originalKey = this.validation.buildObjectKey({
      mediaType,
      ownerId: actor.id,
      filename: input.filename,
      assetId,
    });

    const asset = await this.assets.create({
      id: assetId,
      owner: { connect: { id: actor.id } },
      mediaType,
      visibility: input.visibility ?? MediaVisibility.PRIVATE,
      status: MediaAssetStatus.PENDING_UPLOAD,
      originalKey,
      filename: input.filename,
      mimeType: input.mimeType,
      byteSize: input.byteSize,
      ownerModule: input.ownerModule,
      ownerEntityId: input.ownerEntityId,
      documentPurpose,
      virusScanStatus: VirusScanStatus.PENDING,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });

    const uploadUrl = this.r2.isConfigured()
      ? await this.r2.createPresignedUploadUrl({
          key: originalKey,
          contentType: input.mimeType,
        })
      : null;

    return {
      asset: await this.toResponse(asset),
      upload: {
        method: 'PUT',
        url: uploadUrl,
        headers: { 'Content-Type': input.mimeType },
        key: originalKey,
        mode: uploadUrl ? 'signed_url' : 'server_upload_required',
      },
    };
  }

  /**
   * Direct server-side upload (multipart / buffer). Works with or without R2
   * (when R2 idle, stores processing variants only after buffer is provided).
   */
  async upload(
    actor: AuthenticatedUser,
    input: {
      mediaType: string;
      mimeType: string;
      filename?: string;
      buffer: Buffer;
      visibility?: MediaVisibility;
      ownerModule?: string;
      ownerEntityId?: string;
      durationSeconds?: number;
      documentPurpose?: string;
    },
  ) {
    const mediaType = this.validation.assertMediaType(input.mediaType);
    this.validation.assertMimeAndSize(
      mediaType,
      input.mimeType,
      input.buffer.byteLength,
    );
    const documentPurpose = this.parseDocumentPurpose(mediaType, input.documentPurpose);

    const scan = await this.virusScanner.scan(input.buffer, input.mimeType);
    if (scan.status === 'INFECTED') {
      throw new BadRequestException('File failed virus scan');
    }

    const assetId = randomUUID().replace(/-/g, '').slice(0, 24);
    const originalKey = this.validation.buildObjectKey({
      mediaType,
      ownerId: actor.id,
      filename: input.filename,
      assetId,
    });

    if (this.r2.isConfigured()) {
      await this.r2.putObject({
        key: originalKey,
        body: input.buffer,
        contentType: input.mimeType,
        isPublic: input.visibility === MediaVisibility.PUBLIC,
      });
    }

    let asset = await this.assets.create({
      id: assetId,
      owner: { connect: { id: actor.id } },
      mediaType,
      visibility: input.visibility ?? MediaVisibility.PRIVATE,
      status: MediaAssetStatus.PROCESSING,
      originalKey,
      filename: input.filename,
      mimeType: input.mimeType,
      byteSize: input.buffer.byteLength,
      checksumSha256: sha256(input.buffer),
      ownerModule: input.ownerModule,
      ownerEntityId: input.ownerEntityId,
      documentPurpose,
      virusScanStatus: mapVirusStatus(scan.status),
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });

    asset = await this.processAsset(asset, input.buffer, {
      durationSeconds: input.durationSeconds,
    });

    return this.toResponse(asset, true);
  }

  /**
   * Completes a presigned upload: download (or accept buffer), scan, process.
   */
  async complete(
    actor: AuthenticatedUser,
    input: {
      mediaId: string;
      buffer?: Buffer;
      durationSeconds?: number;
    },
  ) {
    const asset = await this.assets.findById(input.mediaId);
    if (!asset) throw new NotFoundException('Media asset not found');
    this.assertCanManage(asset, actor);

    if (
      asset.status !== MediaAssetStatus.PENDING_UPLOAD &&
      asset.status !== MediaAssetStatus.FAILED
    ) {
      throw new BadRequestException(`Cannot complete media in status ${asset.status}`);
    }

    let buffer = input.buffer;
    if (!buffer && this.r2.isConfigured()) {
      buffer = (await this.r2.getObjectBuffer(asset.originalKey)) ?? undefined;
    }
    if (!buffer) {
      throw new BadRequestException(
        'Upload buffer missing — provide file bytes or ensure R2 object exists',
      );
    }

    this.validation.assertMimeAndSize(asset.mediaType, asset.mimeType, buffer.byteLength);

    const scan = await this.virusScanner.scan(buffer, asset.mimeType);
    if (scan.status === 'INFECTED') {
      await this.assets.update(asset.id, {
        status: MediaAssetStatus.FAILED,
        virusScanStatus: VirusScanStatus.INFECTED,
        processingError: 'Virus scan failed',
      });
      throw new BadRequestException('File failed virus scan');
    }

    await this.assets.update(asset.id, {
      status: MediaAssetStatus.PROCESSING,
      byteSize: buffer.byteLength,
      checksumSha256: sha256(buffer),
      virusScanStatus: mapVirusStatus(scan.status),
    });

    const processed = await this.processAsset(asset, buffer, {
      durationSeconds: input.durationSeconds,
    });

    return this.toResponse(processed, true);
  }

  async getById(id: string, actor?: AuthenticatedUser) {
    const asset = await this.assets.findById(id);
    if (!asset) throw new NotFoundException('Media asset not found');

    if (asset.visibility === MediaVisibility.PRIVATE) {
      if (!actor) throw new ForbiddenException('Authentication required for private media');
      this.assertCanManage(asset, actor);
    }

    return this.toResponse(asset, true);
  }

  /** Owner library — own non-deleted assets. */
  async listMine(
    actor: AuthenticatedUser,
    query: {
      page?: number;
      pageSize?: number;
      mediaType?: string;
      status?: string;
    },
  ) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const mediaType = query.mediaType
      ? this.validation.assertMediaType(query.mediaType)
      : undefined;
    const status = query.status
      ? (query.status.toUpperCase() as MediaAssetStatus)
      : undefined;

    const { items, total } = await this.assets.listForOwner(actor.id, {
      page,
      pageSize,
      mediaType,
      status,
    });

    return {
      items: await Promise.all(items.map((a) => this.toResponse(a, true))),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  /** Admin library with filters + storage usage aggregate. */
  async listAdmin(
    actor: AuthenticatedUser,
    query: {
      page?: number;
      pageSize?: number;
      q?: string;
      mediaType?: string;
      status?: string;
      unused?: boolean;
      duplicates?: boolean;
      includeDeleted?: boolean;
    },
  ) {
    if (!isMediaAdmin(actor.role)) {
      throw new ForbiddenException('Admin media library access required');
    }

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const mediaType = query.mediaType
      ? this.validation.assertMediaType(query.mediaType)
      : undefined;
    const status = query.status
      ? (query.status.toUpperCase() as MediaAssetStatus)
      : undefined;

    const result = await this.assets.listAdmin({
      page,
      pageSize,
      q: query.q,
      mediaType,
      status,
      unused: query.unused,
      duplicates: query.duplicates,
      includeDeleted: query.includeDeleted,
    });

    return {
      items: await Promise.all(result.items.map((a) => this.toResponse(a, true))),
      page,
      pageSize,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
      storageUsage: result.storageUsage,
      duplicateChecksums: result.duplicateChecksums,
    };
  }

  /**
   * Replace bytes for an existing asset: re-process, keep same id, new original key.
   */
  async replace(
    id: string,
    actor: AuthenticatedUser,
    input: {
      buffer: Buffer;
      mimeType: string;
      filename?: string;
      durationSeconds?: number;
    },
  ) {
    const asset = await this.assets.findById(id);
    if (!asset) throw new NotFoundException('Media asset not found');
    this.assertCanManage(asset, actor);

    this.validation.assertMimeAndSize(
      asset.mediaType,
      input.mimeType,
      input.buffer.byteLength,
    );

    const scan = await this.virusScanner.scan(input.buffer, input.mimeType);
    if (scan.status === 'INFECTED') {
      throw new BadRequestException('File failed virus scan');
    }

    const originalKey = this.validation.buildObjectKey({
      mediaType: asset.mediaType,
      ownerId: asset.ownerId ?? actor.id,
      filename: input.filename ?? asset.filename ?? undefined,
      assetId: asset.id,
    });

    if (this.r2.isConfigured()) {
      await this.r2.putObject({
        key: originalKey,
        body: input.buffer,
        contentType: input.mimeType,
        isPublic: asset.visibility === MediaVisibility.PUBLIC,
      });
    }

    let updated = await this.assets.update(asset.id, {
      originalKey,
      filename: input.filename ?? asset.filename,
      mimeType: input.mimeType,
      byteSize: input.buffer.byteLength,
      checksumSha256: sha256(input.buffer),
      status: MediaAssetStatus.PROCESSING,
      virusScanStatus: mapVirusStatus(scan.status),
      processingError: null,
      blurDataUrl: null,
      updatedBy: { connect: { id: actor.id } },
    });

    updated = await this.processAsset(updated, input.buffer, {
      durationSeconds: input.durationSeconds,
    });

    return this.toResponse(updated, true);
  }

  /**
   * Restore a soft-deleted asset within the retention window.
   * R2 objects are retained until the cleanup job reaps them after 72h.
   */
  async restore(id: string, actor: AuthenticatedUser) {
    const asset = await this.assets.findByIdAny(id);
    if (!asset) throw new NotFoundException('Media asset not found');
    this.assertCanManage(asset, actor);

    if (!asset.deletedAt || asset.status !== MediaAssetStatus.DELETED) {
      throw new BadRequestException('Media asset is not soft-deleted');
    }

    const ageMs = Date.now() - asset.deletedAt.getTime();
    const retentionMs = MEDIA_SOFT_DELETE_RETENTION_HOURS * 60 * 60 * 1000;
    if (ageMs > retentionMs) {
      throw new BadRequestException(
        `Restore window expired (${MEDIA_SOFT_DELETE_RETENTION_HOURS}h retention)`,
      );
    }

    const restored = await this.assets.restore(asset.id, actor.id);
    return this.toResponse(restored, true);
  }

  /**
   * Soft-delete only. R2 objects are kept until MediaCleanupService reaps after 72h,
   * so restore remains possible within the retention window.
   */
  async delete(id: string, actor: AuthenticatedUser) {
    const asset = await this.assets.findById(id);
    if (!asset) throw new NotFoundException('Media asset not found');
    this.assertCanManage(asset, actor);

    await this.assets.softDelete(asset.id, actor.id);
    return { success: true as const };
  }

  private async processAsset(
    asset: MediaAssetWithVariants,
    buffer: Buffer,
    opts?: { durationSeconds?: number },
  ): Promise<MediaAssetWithVariants> {
    try {
      if (asset.mediaType === MediaType.IMAGE || asset.mediaType === MediaType.MEDIA_360) {
        const processed = await this.images.process(buffer);
        for (const variant of processed.variants) {
          const key = `${asset.originalKey}.${variant.kind.toLowerCase()}.${
            variant.mimeType === 'image/webp' ? 'webp' : 'jpg'
          }`;
          if (this.r2.isConfigured()) {
            await this.r2.putObject({
              key,
              body: variant.buffer,
              contentType: variant.mimeType,
              isPublic: asset.visibility === MediaVisibility.PUBLIC,
            });
          }
          await this.assets.upsertVariant({
            mediaAssetId: asset.id,
            kind: variant.kind,
            r2Key: key,
            mimeType: variant.mimeType,
            width: variant.width,
            height: variant.height,
            byteSize: variant.byteSize,
          });
        }

        return this.assets.update(asset.id, {
          status: MediaAssetStatus.READY,
          width: processed.width,
          height: processed.height,
          blurDataUrl: processed.blurDataUrl ?? null,
          processingError: null,
        });
      }

      if (asset.mediaType === MediaType.VIDEO) {
        const meta = await this.videos.extractMetadata(buffer, {
          durationSeconds: opts?.durationSeconds,
        });
        const poster = await this.videos.extractPoster(buffer);
        if (poster) {
          const posterKey = `${asset.originalKey}.poster.jpg`;
          if (this.r2.isConfigured()) {
            await this.r2.putObject({
              key: posterKey,
              body: poster,
              contentType: 'image/jpeg',
              isPublic: asset.visibility === MediaVisibility.PUBLIC,
            });
          }
          await this.assets.upsertVariant({
            mediaAssetId: asset.id,
            kind: MediaVariantKind.POSTER,
            r2Key: posterKey,
            mimeType: 'image/jpeg',
            byteSize: poster.byteLength,
          });
        }

        return this.assets.update(asset.id, {
          status: MediaAssetStatus.READY,
          durationSeconds: meta.durationSeconds,
          width: meta.width,
          height: meta.height,
          processingError: null,
        });
      }

      // DOCUMENT / fallback
      return this.assets.update(asset.id, {
        status: MediaAssetStatus.READY,
        processingError: null,
      });
    } catch (error) {
      return this.assets.update(asset.id, {
        status: MediaAssetStatus.FAILED,
        processingError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private parseDocumentPurpose(
    mediaType: MediaType,
    value?: string,
  ): DocumentPurpose | null {
    if (!value) return null;
    const normalized = value.trim().toUpperCase();
    if (!(DOCUMENT_PURPOSES as readonly string[]).includes(normalized)) {
      throw new BadRequestException(
        `documentPurpose must be one of: ${DOCUMENT_PURPOSES.join(', ')}`,
      );
    }
    if (mediaType !== MediaType.DOCUMENT) {
      throw new BadRequestException('documentPurpose is only valid for DOCUMENT media');
    }
    return normalized as DocumentPurpose;
  }

  private assertCanManage(
    asset: { ownerId: string | null },
    actor: AuthenticatedUser,
  ) {
    if (isMediaAdmin(actor.role)) return;
    if (asset.ownerId && asset.ownerId === actor.id) return;
    throw new ForbiddenException('Not allowed to manage this media asset');
  }

  private async toResponse(asset: MediaAssetWithVariants, withUrls = false) {
    const urls: Record<string, string | null> = {};
    if (withUrls) {
      urls.original = await this.resolveUrl(asset.originalKey, asset.visibility);
      for (const variant of asset.variants) {
        urls[variant.kind.toLowerCase()] = await this.resolveUrl(
          variant.r2Key,
          asset.visibility,
        );
      }
    }

    const owner =
      'owner' in asset && asset.owner
        ? {
            id: asset.owner.id,
            displayName: asset.owner.displayName,
            email: asset.owner.email,
            phone: asset.owner.phone,
          }
        : undefined;

    return {
      id: asset.id,
      mediaType: asset.mediaType,
      visibility: asset.visibility,
      status: asset.status,
      originalKey: asset.originalKey,
      filename: asset.filename,
      mimeType: asset.mimeType,
      byteSize: asset.byteSize,
      checksumSha256: asset.checksumSha256,
      width: asset.width,
      height: asset.height,
      durationSeconds: asset.durationSeconds,
      ownerModule: asset.ownerModule,
      ownerEntityId: asset.ownerEntityId,
      documentPurpose: asset.documentPurpose,
      blurDataUrl: asset.blurDataUrl,
      virusScanStatus: asset.virusScanStatus,
      processingError: asset.processingError,
      ownerId: asset.ownerId,
      owner,
      deletedAt: asset.deletedAt,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      variants: asset.variants.map((v) => ({
        kind: v.kind,
        r2Key: v.r2Key,
        mimeType: v.mimeType,
        width: v.width,
        height: v.height,
        byteSize: v.byteSize,
      })),
      urls: withUrls ? urls : undefined,
    };
  }

  private async resolveUrl(key: string, visibility: MediaVisibility) {
    if (!this.r2.isConfigured()) return null;
    if (visibility === MediaVisibility.PUBLIC) {
      return this.r2.getPublicUrl(key);
    }
    return this.r2.createPresignedDownloadUrl({ key });
  }
}

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function mapVirusStatus(
  status: 'CLEAN' | 'INFECTED' | 'SKIPPED' | 'FAILED',
): VirusScanStatus {
  switch (status) {
    case 'CLEAN':
      return VirusScanStatus.CLEAN;
    case 'INFECTED':
      return VirusScanStatus.INFECTED;
    case 'FAILED':
      return VirusScanStatus.FAILED;
    default:
      return VirusScanStatus.SKIPPED;
  }
}
