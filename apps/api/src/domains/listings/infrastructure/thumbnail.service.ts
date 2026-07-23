import { Injectable } from '@nestjs/common';
import { MediaType } from '@autohub/database';
import { AppLoggerService } from '../../../infrastructure/logger/app-logger.service';

type SharpLike = {
  rotate: () => SharpLike;
  metadata: () => Promise<{ width?: number; height?: number }>;
  resize: (
    width: number,
    height: number,
    options: { fit: 'inside'; withoutEnlargement: boolean },
  ) => SharpLike;
  jpeg: (options: { quality: number }) => SharpLike;
  toBuffer: () => Promise<Buffer>;
};

export type ThumbnailResult = {
  thumbnailKey: string;
  width?: number;
  height?: number;
  mimeType?: string;
  byteSize?: number;
  buffer?: Buffer;
};

/**
 * Generates thumbnail metadata/buffers for listing media.
 * IMAGE: sharp resize when buffer provided; otherwise key convention only.
 * VIDEO / MEDIA_360: poster key convention (client or later worker fills object).
 */
@Injectable()
export class ThumbnailService {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext(ThumbnailService.name);
  }

  deriveThumbnailKey(r2Key: string): string {
    const cleaned = r2Key.replace(/^\/+/, '');
    if (cleaned.includes('.')) {
      return cleaned.replace(/(\.[^.]+)?$/, '.thumb.jpg');
    }
    return `${cleaned}.thumb.jpg`;
  }

  async generate(input: {
    r2Key: string;
    mediaType: MediaType;
    sourceBuffer?: Buffer;
  }): Promise<ThumbnailResult> {
    const thumbnailKey = this.deriveThumbnailKey(input.r2Key);

    if (input.mediaType !== MediaType.IMAGE || !input.sourceBuffer) {
      return { thumbnailKey };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sharpImport = require('sharp') as {
        default?: (input: Buffer) => SharpLike;
      } & ((input: Buffer) => SharpLike);
      const sharp = sharpImport.default ?? sharpImport;
      const image = sharp(input.sourceBuffer).rotate();
      const meta = await image.metadata();
      const buffer = await image
        .resize(480, 480, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      return {
        thumbnailKey,
        width: meta.width,
        height: meta.height,
        mimeType: 'image/jpeg',
        byteSize: buffer.byteLength,
        buffer,
      };
    } catch (error) {
      this.logger.warn(
        `Thumbnail generation failed for ${input.r2Key}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { thumbnailKey };
    }
  }
}
