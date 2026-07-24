import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MediaAssetStatus } from '@autohub/database';
import { R2StorageService } from '../../../infrastructure/storage/r2-storage.service';
import { MediaAssetRepository } from '../infrastructure/media-asset.repository';
import { MEDIA_SOFT_DELETE_RETENTION_HOURS } from '../domain/media.policies';

const STALE_PENDING_HOURS = 24;
const SOFT_DELETE_RETENTION_HOURS = MEDIA_SOFT_DELETE_RETENTION_HOURS;
const INTERVAL_MS = 60 * 60 * 1000; // hourly

/**
 * Reaps abandoned PENDING_UPLOAD rows and R2 objects for soft-deleted assets.
 * Lightweight in-process scheduler for Alpha (replace with queue worker later).
 */
@Injectable()
export class MediaCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaCleanupService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly assets: MediaAssetRepository,
    private readonly r2: R2StorageService,
  ) {}

  onModuleInit(): void {
    // Delay first run so boot isn't blocked; then hourly.
    this.timer = setInterval(() => {
      void this.runCleanup().catch((err) =>
        this.logger.warn(`Media cleanup failed: ${err instanceof Error ? err.message : err}`),
      );
    }, INTERVAL_MS);
    this.timer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async runCleanup(): Promise<{ stalePending: number; softDeleted: number }> {
    const stalePending = await this.reapStalePendingUploads();
    const softDeleted = await this.reapSoftDeletedStorage();
    if (stalePending + softDeleted > 0) {
      this.logger.log(
        `Media cleanup: stalePending=${stalePending} softDeletedStorage=${softDeleted}`,
      );
    }
    return { stalePending, softDeleted };
  }

  async reapStalePendingUploads(): Promise<number> {
    const cutoff = new Date(Date.now() - STALE_PENDING_HOURS * 60 * 60 * 1000);
    const stale = await this.assets.findStalePendingUploads(cutoff);
    let count = 0;
    for (const asset of stale) {
      try {
        await this.r2.deleteObject(asset.originalKey);
      } catch {
        /* ignore */
      }
      await this.assets.update(asset.id, {
        status: MediaAssetStatus.DELETED,
        deletedAt: new Date(),
      });
      count += 1;
    }
    return count;
  }

  async reapSoftDeletedStorage(): Promise<number> {
    const cutoff = new Date(Date.now() - SOFT_DELETE_RETENTION_HOURS * 60 * 60 * 1000);
    const rows = await this.assets.findSoftDeletedForCleanup(cutoff);
    let count = 0;
    for (const asset of rows) {
      for (const variant of asset.variants) {
        try {
          await this.r2.deleteObject(variant.r2Key);
        } catch {
          /* ignore */
        }
      }
      try {
        await this.r2.deleteObject(asset.originalKey);
      } catch {
        /* ignore */
      }
      count += 1;
    }
    return count;
  }
}
