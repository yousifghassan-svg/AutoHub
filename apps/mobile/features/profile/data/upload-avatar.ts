import { config } from '@/lib/config';
import { createSecureTokenStorage } from '@/features/auth/data/token-storage';

export type AvatarUploadResult = {
  mediaId: string;
  url: string | null;
};

/**
 * Upload profile avatar via existing MediaAsset pipeline (POST /v1/media/upload).
 */
export async function uploadProfileAvatar(input: {
  uri: string;
  filename?: string;
  mimeType?: string;
  userId?: string;
}): Promise<AvatarUploadResult> {
  const storage = createSecureTokenStorage();
  const session = await storage.load();
  const token = session?.accessToken;

  const form = new FormData();
  form.append('file', {
    uri: input.uri,
    name: input.filename ?? 'avatar.jpg',
    type: input.mimeType ?? 'image/jpeg',
  } as unknown as Blob);
  form.append('mediaType', 'IMAGE');
  form.append('visibility', 'PUBLIC');
  form.append('ownerModule', 'profile');
  if (input.userId) form.append('ownerEntityId', input.userId);

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
    data?: {
      id: string;
      urls?: Record<string, string | null>;
    };
    error?: { message: string | string[] };
  };

  if (!res.ok || !json.success || !json.data) {
    const msg = Array.isArray(json.error?.message)
      ? json.error?.message.join(', ')
      : json.error?.message;
    throw new Error(msg ?? `Avatar upload failed (${res.status})`);
  }

  const urls = json.data.urls ?? {};
  const url = urls.original ?? urls.large ?? urls.medium ?? urls.thumbnail ?? null;

  return { mediaId: json.data.id, url };
}
