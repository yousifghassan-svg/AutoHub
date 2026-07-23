import { Injectable } from '@nestjs/common';
import { MediaVariantKind } from '@autohub/database';
import { AppLoggerService } from '../../../infrastructure/logger/app-logger.service';
import { IMAGE_VARIANTS } from '../domain/media.policies';

export type ProcessedImageVariant = {
  kind: MediaVariantKind;
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  byteSize: number;
};

/**
 * Image pipeline: EXIF-aware rotate, strip metadata, multi-resolution JPEG + WebP.
 */
@Injectable()
export class ImageProcessingService {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext(ImageProcessingService.name);
  }

  async process(buffer: Buffer): Promise<{
    width?: number;
    height?: number;
    variants: ProcessedImageVariant[];
  }> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sharpImport = require('sharp') as {
      default?: (input: Buffer, opts?: { failOn?: string }) => SharpLike;
    } & ((input: Buffer, opts?: { failOn?: string }) => SharpLike);
    const sharp = sharpImport.default ?? sharpImport;

    const base = sharp(buffer, { failOn: 'none' }).rotate(); // honor EXIF orientation
    const meta = await base.metadata();
    const variants: ProcessedImageVariant[] = [];

    for (const spec of IMAGE_VARIANTS) {
      const jpegBuffer = await sharp(buffer, { failOn: 'none' })
        .rotate()
        .resize(spec.width, spec.width, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: spec.quality, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });

      variants.push({
        kind: MediaVariantKind[spec.kind],
        buffer: jpegBuffer.data,
        mimeType: 'image/jpeg',
        width: jpegBuffer.info.width,
        height: jpegBuffer.info.height,
        byteSize: jpegBuffer.data.byteLength,
      });
    }

    const webp = await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    variants.push({
      kind: MediaVariantKind.WEBP,
      buffer: webp.data,
      mimeType: 'image/webp',
      width: webp.info.width,
      height: webp.info.height,
      byteSize: webp.data.byteLength,
    });

    return {
      width: meta.width,
      height: meta.height,
      variants,
    };
  }
}

type SharpLike = {
  rotate: () => SharpLike;
  metadata: () => Promise<{ width?: number; height?: number }>;
  resize: (
    w: number,
    h: number,
    opts: { fit: 'inside'; withoutEnlargement: boolean },
  ) => SharpLike;
  jpeg: (opts: { quality: number; mozjpeg?: boolean }) => SharpLike;
  webp: (opts: { quality: number }) => SharpLike;
  toBuffer: (opts?: { resolveWithObject: true }) => Promise<{
    data: Buffer;
    info: { width: number; height: number };
  }>;
};
