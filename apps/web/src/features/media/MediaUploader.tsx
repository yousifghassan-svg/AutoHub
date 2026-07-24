'use client';

import { useRef, useState, type DragEvent } from 'react';
import { Button, cn } from '@/components/ui';
import { useMediaUpload } from './hooks/useMediaUpload';

type Props = {
  mediaType?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  ownerModule?: string;
  ownerEntityId?: string;
  className?: string;
  onAssetsChange?: (assetIds: string[]) => void;
};

export function MediaUploader({
  mediaType = 'IMAGE',
  visibility = 'PUBLIC',
  ownerModule,
  ownerEntityId,
  className,
  onAssetsChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const {
    files,
    enqueue,
    startAll,
    retry,
    cancel,
    remove,
    setPrimary,
    reorder,
    replace,
  } = useMediaUpload({ mediaType, visibility, ownerModule, ownerEntityId });

  const notify = () => {
    onAssetsChange?.(
      files.filter((f) => f.asset).map((f) => f.asset!.id),
    );
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) enqueue(e.dataTransfer.files);
  };

  const busy = files.some(
    (f) => f.status === 'uploading' || f.status === 'compressing' || f.status === 'processing',
  );

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
        <p className="font-display text-lg font-semibold text-ink">Drop photos here</p>
        <p className="mt-1 max-w-md text-center text-sm text-ink-secondary">
          JPEG, PNG, WebP recommended. HEIC uploads as-is (browser preview may be unavailable).
          Images are compressed in the browser before upload.
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
              void startAll().then(notify);
            }}
          >
            Upload all
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*,.heic,.heif,application/pdf"
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
                notify();
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
                  title="Set as primary"
                  onClick={() => {
                    setPrimary(item.localId);
                    notify();
                  }}
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
                    <p className="truncate text-sm font-medium text-ink">{item.file.name}</p>
                    <p className="text-xs text-ink-secondary">
                      {(item.file.size / 1024).toFixed(0)} KB · {item.status}
                      {item.isPrimary ? ' · primary' : ''}
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
                          accept="image/*,video/*,.heic,.heif,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void replace(item.localId, file).then(notify);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        remove(item.localId);
                        notify();
                      }}
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
