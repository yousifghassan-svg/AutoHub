'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { mediaRepository } from '@/features/media';
import { mediaPublicUrl } from '@/lib/media/url';
import { cn } from '@/components/ui';

type Props = {
  imageAssetIds: string[];
  videoAssetIds: string[];
  className?: string;
};

export function ReviewMediaGallery({
  imageAssetIds,
  videoAssetIds,
  className,
}: Props) {
  const previewAssetIds = useMemo(
    () => [...imageAssetIds, ...videoAssetIds],
    [imageAssetIds, videoAssetIds],
  );

  const previewAssets = useQueries({
    queries: previewAssetIds.map((id) => ({
      queryKey: ['media', id],
      queryFn: () => mediaRepository.getById(id),
      enabled: Boolean(id),
      staleTime: 60_000,
    })),
  });

  if (!previewAssetIds.length) {
    return (
      <div
        className={cn(
          'flex h-48 items-center justify-center rounded-xl bg-surface-muted text-sm text-ink-secondary',
          className,
        )}
      >
        No photos yet — add some before sending for review.
      </div>
    );
  }

  const cover = previewAssets[0]?.data;
  const coverUrl =
    cover?.urls?.thumbnail ??
    mediaPublicUrl(
      cover?.variants?.find(
        (v) => v.kind === 'MEDIUM' || v.kind === 'THUMBNAIL',
      )?.r2Key,
    ) ??
    mediaPublicUrl(cover?.originalKey);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-muted">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-secondary">
            {previewAssets[0]?.isLoading ? 'Loading cover…' : 'Cover photo'}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white">
          Cover
        </span>
      </div>

      {previewAssetIds.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {previewAssets.map((q, index) => {
            const asset = q.data;
            const thumb =
              asset?.urls?.thumbnail ??
              mediaPublicUrl(
                asset?.variants?.find((v) => v.kind === 'THUMBNAIL')?.r2Key,
              ) ??
              mediaPublicUrl(asset?.originalKey);
            const assetId = previewAssetIds[index];
            const isVideo =
              Boolean(assetId) && videoAssetIds.includes(assetId!);
            if (index === 0) return null;
            return (
              <div
                key={assetId ?? index}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted"
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-ink-secondary">
                    {q.isLoading ? '…' : isVideo ? 'Video' : 'Photo'}
                  </div>
                )}
                {isVideo ? (
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[9px] text-white">
                    Video
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
