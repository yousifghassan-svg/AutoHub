import { config } from '@/lib/config';
import { getHttpClient, getTokenStorage } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import type { MediaAsset, MediaType, PresignResult } from '../domain/types';

export type ListMediaQuery = {
  page?: number;
  pageSize?: number;
  mediaType?: string;
  status?: string;
};

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  }
  const q = sp.toString();
  return q ? `?${q}` : '';
}

async function authHeader(): Promise<Record<string, string>> {
  const session = await getTokenStorage().load();
  if (!session?.accessToken) return {};
  return { Authorization: `Bearer ${session.accessToken}` };
}

export const mediaRepository = {
  listMine(query: ListMediaQuery = {}) {
    return getHttpClient().get<{
      items: MediaAsset[];
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }>(`/v1/media${buildQuery(query)}`);
  },

  getById(id: string) {
    return getHttpClient().get<MediaAsset>(`/v1/media/${id}`);
  },

  presign(input: {
    mediaType: MediaType | string;
    mimeType: string;
    byteSize: number;
    filename?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
    ownerModule?: string;
    ownerEntityId?: string;
    documentPurpose?: string;
  }) {
    return getHttpClient().post<PresignResult>('/v1/media/presign', input);
  },

  complete(input: { mediaId: string; fileBase64?: string; durationSeconds?: number }) {
    return getHttpClient().post<MediaAsset>('/v1/media/complete', input);
  },

  async uploadMultipart(
    file: File,
    fields: {
      mediaType: MediaType | string;
      visibility?: string;
      ownerModule?: string;
      ownerEntityId?: string;
      documentPurpose?: string;
      durationSeconds?: number;
    },
    signal?: AbortSignal,
    onProgress?: (pct: number) => void,
  ): Promise<MediaAsset> {
    const form = new FormData();
    form.append('file', file);
    form.append('mediaType', fields.mediaType);
    if (fields.visibility) form.append('visibility', fields.visibility);
    if (fields.ownerModule) form.append('ownerModule', fields.ownerModule);
    if (fields.ownerEntityId) form.append('ownerEntityId', fields.ownerEntityId);
    if (fields.documentPurpose) form.append('documentPurpose', fields.documentPurpose);
    if (fields.durationSeconds != null) {
      form.append('durationSeconds', String(fields.durationSeconds));
    }

    return xhrUpload<MediaAsset>({
      url: `${config.apiUrl}/v1/media/upload`,
      method: 'POST',
      form,
      headers: await authHeader(),
      signal,
      onProgress,
    });
  },

  async putToSignedUrl(
    url: string,
    file: File,
    contentType: string,
    signal?: AbortSignal,
    onProgress?: (pct: number) => void,
  ): Promise<void> {
    await xhrUpload<void>({
      url,
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
      signal,
      onProgress,
      raw: true,
    });
  },

  delete(id: string) {
    return getHttpClient().delete<{ success: boolean }>(`/v1/media/${id}`);
  },

  restore(id: string) {
    return getHttpClient().post<MediaAsset>(`/v1/media/${id}/restore`);
  },

  async replaceMultipart(
    id: string,
    file: File,
    signal?: AbortSignal,
    onProgress?: (pct: number) => void,
  ): Promise<MediaAsset> {
    const form = new FormData();
    form.append('file', file);
    return xhrUpload<MediaAsset>({
      url: `${config.apiUrl}/v1/media/${id}/replace`,
      method: 'POST',
      form,
      headers: await authHeader(),
      signal,
      onProgress,
    });
  },
};

type XhrOpts = {
  url: string;
  method: 'POST' | 'PUT';
  form?: FormData;
  body?: Blob;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onProgress?: (pct: number) => void;
  raw?: boolean;
};

function xhrUpload<T>(opts: XhrOpts): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(opts.method, opts.url);
    for (const [k, v] of Object.entries(opts.headers ?? {})) {
      xhr.setRequestHeader(k, v);
    }
    xhr.responseType = opts.raw ? 'text' : 'json';

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    const onAbort = () => {
      xhr.abort();
      reject(new ApiError({ message: 'Upload cancelled', statusCode: 0, code: 'CANCELLED' }));
    };
    opts.signal?.addEventListener('abort', onAbort);

    xhr.onload = () => {
      opts.signal?.removeEventListener('abort', onAbort);
      if (opts.raw) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(undefined as T);
          return;
        }
        reject(
          new ApiError({
            message: `Upload failed (${xhr.status})`,
            statusCode: xhr.status,
          }),
        );
        return;
      }
      const json = xhr.response as {
        success?: boolean;
        data?: T;
        error?: { message?: string | string[]; statusCode?: number; code?: string };
      };
      if (xhr.status >= 200 && xhr.status < 300 && json?.success) {
        resolve(json.data as T);
        return;
      }
      const message = Array.isArray(json?.error?.message)
        ? json.error.message.join(', ')
        : (json?.error?.message ?? `Upload failed (${xhr.status})`);
      reject(
        new ApiError({
          message,
          statusCode: json?.error?.statusCode ?? xhr.status,
          code: json?.error?.code,
        }),
      );
    };

    xhr.onerror = () => {
      opts.signal?.removeEventListener('abort', onAbort);
      reject(new ApiError({ message: 'Network request failed', statusCode: 0, code: 'NETWORK' }));
    };

    xhr.send(opts.form ?? opts.body ?? null);
  });
}

export async function uploadMediaFile(
  file: File,
  options: {
    mediaType?: MediaType | string;
    visibility?: 'PUBLIC' | 'PRIVATE';
    ownerModule?: string;
    ownerEntityId?: string;
    signal?: AbortSignal;
    onProgress?: (pct: number) => void;
  } = {},
): Promise<MediaAsset> {
  const mediaType = options.mediaType ?? 'IMAGE';
  const visibility = options.visibility ?? 'PUBLIC';

  const presign = await mediaRepository.presign({
    mediaType,
    mimeType: file.type || 'application/octet-stream',
    byteSize: file.size,
    filename: file.name,
    visibility,
    ownerModule: options.ownerModule,
    ownerEntityId: options.ownerEntityId,
  });

  if (presign.upload.mode === 'signed_url' && presign.upload.url) {
    await mediaRepository.putToSignedUrl(
      presign.upload.url,
      file,
      file.type || 'application/octet-stream',
      options.signal,
      options.onProgress,
    );
    options.onProgress?.(100);
    return mediaRepository.complete({ mediaId: presign.asset.id });
  }

  return mediaRepository.uploadMultipart(
    file,
    {
      mediaType,
      visibility,
      ownerModule: options.ownerModule,
      ownerEntityId: options.ownerEntityId,
    },
    options.signal,
    options.onProgress,
  );
}
