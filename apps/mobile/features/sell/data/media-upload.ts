import { config } from '@/lib/config';
import { createSecureTokenStorage } from '@/features/auth/data/token-storage';
import type { MediaKind, WizardMediaItem } from '../domain/types';

type UploadResult = {
  assetId: string;
  originalKey: string;
};

function toPlatformMediaType(kind: MediaKind): string {
  if (kind === 'VIDEO') return 'VIDEO';
  if (kind === '360_MEDIA') return 'MEDIA_360';
  return 'IMAGE';
}

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

/**
 * Multipart upload via POST /v1/media/upload (Bearer).
 * Retries transient network / 5xx failures with exponential backoff.
 */
export async function uploadMediaAsset(
  item: WizardMediaItem,
  listingId: string,
  opts?: { maxAttempts?: number },
): Promise<UploadResult> {
  const maxAttempts = opts?.maxAttempts ?? 3;
  const storage = createSecureTokenStorage();
  const session = await storage.load();
  const token = session?.accessToken;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const form = new FormData();
      form.append('file', {
        uri: item.uri,
        name: item.filename,
        type: item.mimeType,
      } as unknown as Blob);
      form.append('mediaType', toPlatformMediaType(item.kind));
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

      return { assetId: json.data.id, originalKey: json.data.originalKey };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Media upload failed');
      const retryable =
        e instanceof UploadHttpError ? e.retryable : true; // network errors
      if (!retryable || attempt === maxAttempts) throw lastError;
      await sleep(400 * 2 ** (attempt - 1));
    }
  }

  throw lastError ?? new Error('Media upload failed');
}
