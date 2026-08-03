/**
 * Client-side media rules mirroring `apps/api/.../media.policies.ts`.
 * Platform service — not vehicle-specific.
 */

export const CLIENT_MEDIA_MAX_BYTES: Record<string, number> = {
  IMAGE: 15 * 1024 * 1024,
  VIDEO: 200 * 1024 * 1024,
  MEDIA_360: 100 * 1024 * 1024,
  DOCUMENT: 25 * 1024 * 1024,
};

export const CLIENT_ALLOWED_MIME_TYPES: Record<string, string[]> = {
  IMAGE: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  MEDIA_360: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export function normalizeClientMediaType(mediaType: string): string {
  return mediaType.trim().toUpperCase().replace('360_MEDIA', 'MEDIA_360');
}

export type ClientMediaValidation =
  | { ok: true }
  | { ok: false; error: string };

export function validateClientMediaFile(
  file: File,
  mediaType: string,
): ClientMediaValidation {
  const type = normalizeClientMediaType(mediaType);
  const max = CLIENT_MEDIA_MAX_BYTES[type];
  if (max == null) {
    return { ok: false, error: `Unsupported media type: ${mediaType}` };
  }

  const mime = (file.type || '').toLowerCase();
  const allowed = CLIENT_ALLOWED_MIME_TYPES[type] ?? [];

  // HEIC often reports empty type in some browsers — allow by extension.
  const name = file.name.toLowerCase();
  const heicByExt =
    type === 'IMAGE' && (name.endsWith('.heic') || name.endsWith('.heif'));

  if (mime && !allowed.includes(mime) && !heicByExt) {
    return {
      ok: false,
      error: `Unsupported file type${mime ? ` (${mime})` : ''}. Allowed: ${allowed.join(', ')}`,
    };
  }

  if (!mime && !heicByExt && type === 'IMAGE') {
    // Some browsers omit type for jpeg/png — allow if size is within limit.
  } else if (!mime && !heicByExt) {
    return { ok: false, error: 'Could not detect file type' };
  }

  if (file.size <= 0) {
    return { ok: false, error: 'File is empty' };
  }

  if (file.size > max) {
    const mb = (max / (1024 * 1024)).toFixed(0);
    return { ok: false, error: `File exceeds ${mb} MB limit for ${type}` };
  }

  return { ok: true };
}
