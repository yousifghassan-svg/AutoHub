'use client';

import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Button, cn } from '@/components/ui';
import { mediaRepository } from './data/media.repository';
import { useMediaUpload } from './hooks/useMediaUpload';
import { orderedReadyAssetIds } from './lib/ready-asset-ids';

type Props = {
  mediaType?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  ownerModule?: string;
  ownerEntityId?: string;
  /** Restore READY assets from listing draft (ids only). */
  initialAssetIds?: string[];
  className?: string;
  onAssetsChange?: (assetIds: string[]) => void;
};

export function MediaUploader({
  mediaType = 'IMAGE',
  visibility = 'PUBLIC',
  ownerModule,
  ownerEntityId,
  initialAssetIds,
  className,
  onAssetsChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const hydratedRef = useRef(false);
  const {
    files,
    enqueue,
    hydrateFromAssets,
    startAll,
    retry,
    cancel,
    remove,
    setPrimary,
    reorder,
    replace,
  } = useMediaUpload({ mediaType, visibility, ownerModule, ownerEntityId });

  const readyIds = useMemo(() => orderedReadyAssetIds(files), [files]);
  const lastNotified = useRef<string | null>(null);
  /** Avoid wiping draft ids with [] before hydration finishes. */
  const awaitingHydration = useRef(Boolean(initialAssetIds?.length));

  useEffect(() => {
    if (awaitingHydration.current) {
      if (readyIds.length === 0 && files.length === 0) return;
      awaitingHydration.current = false;
    }
    const key = readyIds.join(',');
    if (lastNotified.current === key) return;
    lastNotified.current = key;
    onAssetsChange?.(readyIds);
  }, [readyIds, files.length, onAssetsChange]);

  useEffect(() => {
    if (hydratedRef.current || !initialAssetIds?.length) return;
    hydratedRef.current = true;
    let cancelled = false;
    void (async () => {
      const assets = await Promise.all(
        initialAssetIds.map((id) =>
          mediaRepository.getById(id).catch(() => null),
        ),
      );
      if (cancelled) return;
      const ready = assets.filter((a): a is NonNullable<typeof a> => Boolean(a));
      if (ready.length) {
        hydrateFromAssets(ready);
      } else {
        // Hydration failed — keep draft ids; stop blocking notify forever.
        awaitingHydration.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateFromAssets, initialAssetIds]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) enqueue(e.dataTransfer.files);
  };

  const busy = files.some(
    (f) => f.status === 'uploading' || f.status === 'compressing' || f.status === 'processing',
  );

  const accept =
    mediaType === 'VIDEO'
      ? 'video/mp4,video/webm,video/quicktime'
      : mediaType === 'DOCUMENT'
        ? 'application/pdf,.doc,.docx'
        : 'image/jpeg,image/png,image/webp,image/gif,.heic,.heif';

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition',
          dragging
            ? 'border-brand bg-brand/5'
            : 'border-border bg-surface-muted/40',
        )}
      >
        <p className="font-display text-lg font-semibold text-ink">
          {mediaType === 'VIDEO' ? 'Drop videos here' : 'Drop media here'}
        </p>
        <p className="mt-1 max-w-md text-center text-sm text-ink-secondary">
          {mediaType === 'VIDEO'
            ? 'MP4, WebM, or QuickTime. Upload progress and retry are supported.'
            : 'JPEG, PNG, WebP recommended. HEIC uploads as-is (browser preview may be unavailable). Images are compressed in the browser before upload.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => inputRef.current?.click()}>
            Choose files
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!files.some((f) => f.status === 'queued' || f.status === 'error') || busy}
            onClick={() => {
              void startAll();
            }}
          >
            Upload all
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) enqueue(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {files.length ? (
        <ul className="space-y-3">
          {files.map((item, index) => (
            <li
              key={item.localId}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex == null) return;
                reorder(dragIndex, index);
                setDragIndex(null);
              }}
              className="flex gap-3 rounded-lg border border-border bg-surface p-3"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                {item.previewUrl || item.asset?.urls?.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl ?? item.asset?.urls?.thumbnail ?? undefined}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink-secondary">
                    File
                  </div>
                )}
                <button
                  type="button"
                  title="Set as cover"
                  onClick={() => setPrimary(item.localId)}
                  className={cn(
                    'absolute left-1 top-1 rounded-full px-1.5 text-xs',
                    item.isPrimary ? 'bg-brand text-white' : 'bg-black/50 text-white',
                  )}
                >
                  ★
                </button>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.file.name || item.asset?.filename || 'Media'}
                    </p>
                    <p className="text-xs text-ink-secondary">
                      {item.file.size
                        ? `${(item.file.size / 1024).toFixed(0)} KB · `
                        : ''}
                      {item.status}
                      {item.isPrimary ? ' · cover' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {item.status === 'error' || item.status === 'cancelled' ? (
                      <Button type="button" variant="ghost" onClick={() => retry(item.localId)}>
                        Retry
                      </Button>
                    ) : null}
                    {item.status === 'uploading' || item.status === 'compressing' ? (
                      <Button type="button" variant="ghost" onClick={() => cancel(item.localId)}>
                        Cancel
                      </Button>
                    ) : null}
                    {item.asset ? (
                      <label className="inline-flex cursor-pointer items-center">
                        <span className="rounded-md px-2 py-1 text-sm text-ink-secondary hover:bg-surface-muted">
                          Replace
                        </span>
                        <input
                          type="file"
                          accept={accept}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void replace(item.localId, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(item.localId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={cn(
                      'h-full transition-all',
                      item.status === 'error' ? 'bg-error' : 'bg-brand',
                    )}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                {item.error ? (
                  <p className="text-xs text-error">{item.error}</p>
                ) : null}
                {item.asset ? (
                  <p className="text-xs text-ink-secondary">Asset {item.asset.id}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
