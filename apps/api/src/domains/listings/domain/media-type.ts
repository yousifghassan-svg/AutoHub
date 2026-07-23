import { MediaType } from '@autohub/database';
import { BadRequestException } from '@nestjs/common';

/** API-facing media types (360_MEDIA maps to DB MEDIA_360). */
export type ApiMediaType = 'IMAGE' | 'VIDEO' | '360_MEDIA';

const SUPPORTED: ApiMediaType[] = ['IMAGE', 'VIDEO', '360_MEDIA'];

export function parseApiMediaType(value: string): MediaType {
  const normalized = value.trim().toUpperCase();
  if (normalized === '360_MEDIA' || normalized === 'MEDIA_360') {
    return MediaType.MEDIA_360;
  }
  if (normalized === 'IMAGE') return MediaType.IMAGE;
  if (normalized === 'VIDEO') return MediaType.VIDEO;
  throw new BadRequestException(
    `Unsupported media type. Allowed: ${SUPPORTED.join(', ')}`,
  );
}

export function toApiMediaType(value: MediaType): ApiMediaType | 'DOCUMENT' {
  if (value === MediaType.MEDIA_360) return '360_MEDIA';
  if (value === MediaType.DOCUMENT) return 'DOCUMENT';
  return value;
}

export function assertSupportedListingMedia(type: MediaType): void {
  if (type === MediaType.DOCUMENT) {
    throw new BadRequestException(
      'DOCUMENT media is not supported on listing media endpoints in Sprint 4',
    );
  }
}
