'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { uploadMediaFile } from '@/features/media/data/media.repository';

type Props = {
  userId: string | undefined;
  avatarUrl: string;
  onUploaded: (input: { mediaId: string; url: string }) => void;
  onCleared: () => void;
};

/**
 * Single-image avatar upload via existing MediaAsset / R2 pipeline
 * (POST /v1/media/upload, ownerModule=profile).
 */
export function AvatarUploadField({ userId, avatarUrl, onUploaded, onCleared }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const asset = await uploadMediaFile(file, {
        mediaType: 'IMAGE',
        visibility: 'PUBLIC',
        ownerModule: 'profile',
        ownerEntityId: userId,
      });
      const url =
        asset.urls?.original ??
        asset.urls?.large ??
        asset.urls?.medium ??
        asset.urls?.thumbnail ??
        '';
      onUploaded({ mediaId: asset.id, url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-surface-muted">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-secondary">
              No photo
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload photo'}
          </Button>
          {avatarUrl ? (
            <Button type="button" variant="ghost" disabled={uploading} onClick={onCleared}>
              Remove
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            void onPick(file);
          }}
        />
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <p className="text-xs text-ink-secondary">
        Uploads through AutoHub media storage (public image). You can also paste a URL below.
      </p>
    </div>
  );
}
