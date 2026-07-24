const HEIC_TYPES = new Set(['image/heic', 'image/heif']);
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return HEIC_TYPES.has(file.type) || name.endsWith('.heic') || name.endsWith('.heif');
}

/**
 * Client-side canvas compress to JPEG/WebP.
 * HEIC is not decoded by most browsers — returns the original file and a note.
 */
export async function compressImage(
  file: File,
  opts?: { maxDimension?: number; quality?: number; preferWebp?: boolean },
): Promise<{ file: File; note?: string }> {
  if (isHeicFile(file)) {
    return {
      file,
      note: 'HEIC is not supported for browser compression — upload original or convert to JPEG first.',
    };
  }

  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return { file };
  }

  const maxDim = opts?.maxDimension ?? MAX_DIMENSION;
  const quality = opts?.quality ?? JPEG_QUALITY;
  const preferWebp = opts?.preferWebp ?? false;

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { file };
    ctx.drawImage(bitmap, 0, 0, width, height);

    const mime =
      preferWebp && typeof canvas.toBlob === 'function' ? 'image/webp' : 'image/jpeg';

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mime, quality);
    });

    if (!blob || blob.size >= file.size) {
      return { file };
    }

    const ext = mime === 'image/webp' ? 'webp' : 'jpg';
    const base = file.name.replace(/\.[^.]+$/, '');
    return {
      file: new File([blob], `${base}.${ext}`, { type: mime, lastModified: Date.now() }),
    };
  } finally {
    bitmap.close();
  }
}
