import { config } from '@/lib/config';
import { createSecureTokenStorage } from '@/features/auth/data/token-storage';
import type { CreateMediaItem } from '../domain/media';
import { compressListingImage } from './compress-image';

export type UploadResult = { assetId: string; originalKey: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

class UploadHttpError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'UploadHttpError';
  }
}

export async function uploadMediaAsset(
  item: CreateMediaItem,
  listingId: string,
  opts?: {
    maxAttempts?: number;
    onProgress?: (progress: number) => void;
    compress?: boolean;
  },
): Promise<UploadResult> {
  const maxAttempts = opts?.maxAttempts ?? 3;
  const storage = createSecureTokenStorage();
  const session = await storage.load();
  const token = session?.accessToken;

  let uri = item.uri;
  let mimeType = item.mimeType;
  let filename = item.filename;

  if (opts?.compress !== false && item.kind === 'IMAGE') {
    try {
      opts?.onProgress?.(0.1);
      const compressed = await compressListingImage(uri);
      uri = compressed.uri;
      mimeType = 'image/jpeg';
      filename = filename.replace(/\.\w+$/, '') + '.jpg';
    } catch {
      // keep original
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      opts?.onProgress?.(0.25 + attempt * 0.05);
      const form = new FormData();
      form.append('file', {
        uri,
        name: filename,
        type: mimeType,
      } as unknown as Blob);
      form.append('mediaType', item.kind === 'VIDEO' ? 'VIDEO' : 'IMAGE');
      form.append('visibility', 'PUBLIC');
      form.append('ownerModule', 'listings');
      form.append('ownerEntityId', listingId);

      const res = await fetch(`${config.apiUrl}/v1/media/upload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      });

      const json = (await res.json()) as {
        success: boolean;
        data?: { id: string; originalKey: string };
        error?: { message: string | string[] };
      };

      if (!res.ok || !json.success || !json.data) {
        const msg = Array.isArray(json.error?.message)
          ? json.error?.message.join(', ')
          : json.error?.message;
        throw new UploadHttpError(
          msg ?? `Media upload failed (${res.status})`,
          isRetryableStatus(res.status),
        );
      }

      opts?.onProgress?.(1);
      return { assetId: json.data.id, originalKey: json.data.originalKey };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Media upload failed');
      const retryable = e instanceof UploadHttpError ? e.retryable : true;
      if (!retryable || attempt === maxAttempts) throw lastError;
      await sleep(400 * 2 ** (attempt - 1));
    }
  }

  throw lastError ?? new Error('Media upload failed');
}
