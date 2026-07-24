'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
import type { AdminListingMedia } from '@/lib/api/types';
import { Button, Card, useToast } from '@/components/ui';
import { config } from '@/lib/config';
import { getTokenStorage } from '@/lib/api/client';

function mediaUrl(item: AdminListingMedia): string {
  const key = item.thumbnailKey || item.r2Key;
  if (!key) return '';
  if (key.startsWith('http')) return key;
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '';
  return base ? `${base.replace(/\/$/, '')}/${key}` : `https://picsum.photos/seed/${item.id}/400/300`;
}

export function VehicleMediaPanel({
  listingId,
  media,
}: {
  listingId: string;
  media: AdminListingMedia[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [docPurpose, setDocPurpose] = useState('OTHER');

  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ['admin', 'listings', listingId] });

  const reorder = useMutation({
    mutationFn: (orderedIds: string[]) => adminApi.listings.reorderMedia(listingId, orderedIds),
    onSuccess: () => {
      toast('Gallery reordered', 'success');
      invalidate();
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Reorder failed', 'error'),
  });

  const remove = useMutation({
    mutationFn: (mediaId: string) => adminApi.listings.deleteMedia(listingId, mediaId),
    onSuccess: () => {
      toast('Media removed', 'success');
      invalidate();
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Delete failed', 'error'),
  });

  const setPrimary = useMutation({
    mutationFn: (mediaId: string) => adminApi.listings.setPrimaryMedia(listingId, mediaId),
    onSuccess: () => {
      toast('Primary image updated', 'success');
      invalidate();
    },
    onError: (e) => toast(e instanceof Error ? e.message : 'Failed', 'error'),
  });

  const uploadFiles = async (files: FileList | null, mediaType: string) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const session = await getTokenStorage().load();
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        form.append('mediaType', mediaType);
        form.append('visibility', 'PUBLIC');
        form.append('ownerModule', 'listing');
        form.append('ownerEntityId', listingId);
        if (mediaType === 'DOCUMENT') form.append('documentPurpose', docPurpose);

        const res = await fetch(`${config.apiUrl}/v1/media/upload`, {
          method: 'POST',
          headers: session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : undefined,
          body: form,
        });
        const json = (await res.json()) as {
          success: boolean;
          data?: { id: string; originalKey?: string };
          error?: { message?: string };
        };
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error?.message ?? 'Upload failed');
        }
        await adminApi.listings.addMedia(listingId, {
          mediaAssetId: json.data.id,
          mediaType,
          documentPurpose: mediaType === 'DOCUMENT' ? docPurpose : undefined,
        });
      }
      toast('Upload complete', 'success');
      invalidate();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Upload failed', 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const move = (id: string, dir: -1 | 1) => {
    const ids = media.map((m) => m.id);
    const idx = ids.indexOf(id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= ids.length) return;
    const copy = [...ids];
    const [item] = copy.splice(idx, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    reorder.mutate(copy);
  };

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Media</h2>
          <p className="text-sm text-ink-secondary">
            Images, video, and documents. First image is primary.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <select
            className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
            value={docPurpose}
            onChange={(e) => setDocPurpose(e.target.value)}
            aria-label="Document purpose"
          >
            <option value="REGISTRATION">Registration</option>
            <option value="INSPECTION">Inspection</option>
            <option value="OWNERSHIP">Ownership</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/mp4,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              const type = file?.type.startsWith('video/')
                ? 'VIDEO'
                : file?.type === 'application/pdf'
                  ? 'DOCUMENT'
                  : 'IMAGE';
              void uploadFiles(e.target.files, type);
            }}
          />
          <Button type="button" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? 'Uploading…' : 'Upload files'}
          </Button>
        </div>
      </div>

      {media.length === 0 ? (
        <p className="text-sm text-ink-secondary">No media attached yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item, index) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-border bg-surface-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(item)}
                alt={item.mediaType}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <p className="text-xs font-semibold text-ink">
                  {item.mediaType}
                  {index === 0 ? ' · Primary' : ''}
                </p>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => move(item.id, -1)}
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => move(item.id, 1)}
                  >
                    →
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setPrimary.mutate(item.id)}
                  >
                    Primary
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => remove.mutate(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
