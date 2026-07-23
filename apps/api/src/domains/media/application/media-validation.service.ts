import { BadRequestException, Injectable } from '@nestjs/common';
import { MediaType } from '@autohub/database';
import {
  ALLOWED_MIME_TYPES,
  MEDIA_MAX_BYTES,
} from '../domain/media.policies';

@Injectable()
export class MediaValidationService {
  assertMediaType(value: string): MediaType {
    const normalized = value.trim().toUpperCase().replace('360_MEDIA', 'MEDIA_360');
    if (!Object.values(MediaType).includes(normalized as MediaType)) {
      throw new BadRequestException(
        `Unsupported mediaType. Allowed: IMAGE, VIDEO, MEDIA_360, DOCUMENT`,
      );
    }
    return normalized as MediaType;
  }

  assertMimeAndSize(mediaType: MediaType, mimeType: string, byteSize: number) {
    const allowed = ALLOWED_MIME_TYPES[mediaType] ?? [];
    if (!allowed.includes(mimeType.toLowerCase())) {
      throw new BadRequestException(
        `MIME type ${mimeType} is not allowed for ${mediaType}`,
      );
    }
    const max = MEDIA_MAX_BYTES[mediaType] ?? 0;
    if (byteSize <= 0) {
      throw new BadRequestException('byteSize must be > 0');
    }
    if (byteSize > max) {
      throw new BadRequestException(
        `File exceeds max size for ${mediaType} (${max} bytes)`,
      );
    }
  }

  buildObjectKey(input: {
    mediaType: MediaType;
    ownerId?: string;
    filename?: string;
    assetId: string;
  }): string {
    const safeName = (input.filename ?? 'file')
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .slice(0, 80);
    const owner = input.ownerId ?? 'anonymous';
    const folder = input.mediaType.toLowerCase();
    return `media/${folder}/${owner}/${input.assetId}/${safeName}`;
  }
}
