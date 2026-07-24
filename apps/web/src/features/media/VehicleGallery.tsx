'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/components/ui';
import { listingImageSrc } from '@/lib/media/url';
import { MediaImage } from './MediaImage';
import type { GalleryItem } from './domain/types';

type Props = {
  items: GalleryItem[];
  title?: string;
  className?: string;
};

export function VehicleGallery({ items, title = 'Gallery', className }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const safeItems = items.length
    ? items
    : [{ id: 'placeholder', url: null, kind: 'IMAGE' }];

  const current = safeItems[Math.min(active, safeItems.length - 1)]!;

  const go = useCallback(
    (delta: number) => {
      setActive((i) => (i + delta + safeItems.length) % safeItems.length);
      setZoom(1);
    },
    [safeItems.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(3, z + 0.25));
      if (e.key === '-') setZoom((z) => Math.max(1, z - 0.25));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, go]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    const t = e.changedTouches[0];
    touchStart.current = null;
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    if (Math.abs(dx) < 40) return;
    go(dx < 0 ? 1 : -1);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <button
        type="button"
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-muted"
        onClick={() => setLightbox(true)}
        aria-label={`Open ${title}`}
      >
        <MediaImage
          alt={title}
          fallbackUrl={listingImageSrc(current.url, current.id)}
          blurDataUrl={current.blurDataUrl}
          variants={current.variants}
          urls={current.urls}
          loading="eager"
          className="absolute inset-0"
        />
        {current.kind === '360_MEDIA' || current.kind === 'MEDIA_360' ? (
          <span className="absolute left-3 top-3 rounded bg-ink/80 px-2 py-1 text-xs font-semibold text-white">
            360°
          </span>
        ) : null}
      </button>

      {safeItems.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {safeItems.map((item, index) => (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                className={cn(
                  'relative h-16 w-16 overflow-hidden rounded-md ring-offset-2',
                  index === active ? 'ring-2 ring-brand' : 'ring-1 ring-border',
                )}
                aria-label={`Show image ${index + 1}`}
              >
                <MediaImage
                  alt=""
                  fallbackUrl={listingImageSrc(item.url, item.id)}
                  blurDataUrl={item.blurDataUrl}
                  variants={item.variants}
                  urls={item.urls}
                  className="h-full w-full"
                  sizes="64px"
                />
                {item.kind === '360_MEDIA' || item.kind === 'MEDIA_360' ? (
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-ink/80 px-1 text-[10px] text-white">
                    360
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="text-sm">
              {active + 1} / {safeItems.length}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded px-3 py-1 text-sm hover:bg-white/10"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                −
              </button>
              <button
                type="button"
                className="rounded px-3 py-1 text-sm hover:bg-white/10"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              >
                +
              </button>
              <button
                type="button"
                className="rounded px-3 py-1 text-sm hover:bg-white/10"
                onClick={() => setLightbox(false)}
              >
                Close
              </button>
            </div>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-8">
            <button
              type="button"
              className="absolute left-2 z-10 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              onClick={() => go(-1)}
              aria-label="Previous"
            >
              ←
            </button>
            <div
              className="max-h-full max-w-full transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <MediaImage
                alt={title}
                fallbackUrl={listingImageSrc(current.url, current.id)}
                blurDataUrl={current.blurDataUrl}
                variants={current.variants}
                urls={current.urls}
                loading="eager"
                className="max-h-[80vh] w-auto max-w-[90vw] object-contain"
                sizes="90vw"
              />
            </div>
            <button
              type="button"
              className="absolute right-2 z-10 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              onClick={() => go(1)}
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
