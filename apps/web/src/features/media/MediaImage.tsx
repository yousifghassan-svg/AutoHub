'use client';

import { mediaPublicUrl } from '@/lib/media/url';
import { cn } from '@/components/ui';
import type { MediaVariant } from './domain/types';

type Props = {
  alt: string;
  className?: string;
  blurDataUrl?: string | null;
  variants?: MediaVariant[];
  urls?: Record<string, string | null>;
  fallbackUrl?: string | null;
  sizes?: string;
  loading?: 'lazy' | 'eager';
};

function resolveVariantUrl(
  variants: MediaVariant[] | undefined,
  urls: Record<string, string | null> | undefined,
  kind: string,
): string | null {
  const fromUrls = urls?.[kind.toLowerCase()] ?? null;
  if (fromUrls) return fromUrls;
  const variant = variants?.find((v) => v.kind.toUpperCase() === kind.toUpperCase());
  return mediaPublicUrl(variant?.r2Key ?? null);
}

/**
 * Responsive image using platform variants (thumbnail/small/medium/large/webp).
 */
export function MediaImage({
  alt,
  className,
  blurDataUrl,
  variants,
  urls,
  fallbackUrl,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  loading = 'lazy',
}: Props) {
  const thumb = resolveVariantUrl(variants, urls, 'THUMBNAIL');
  const small = resolveVariantUrl(variants, urls, 'SMALL');
  const medium = resolveVariantUrl(variants, urls, 'MEDIUM');
  const large = resolveVariantUrl(variants, urls, 'LARGE');
  const webp = resolveVariantUrl(variants, urls, 'WEBP');
  const original = urls?.original ?? fallbackUrl ?? medium ?? large ?? small ?? thumb;

  if (!original) {
    return (
      <div
        className={cn('bg-surface-muted', className)}
        role="img"
        aria-label={alt}
      />
    );
  }

  const jpegSrcSet = [
    thumb && `${thumb} 320w`,
    small && `${small} 640w`,
    medium && `${medium} 1280w`,
    large && `${large} 1920w`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <picture>
      {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
      {jpegSrcSet ? <source type="image/jpeg" srcSet={jpegSrcSet} sizes={sizes} /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={original}
        alt={alt}
        loading={loading}
        decoding="async"
        sizes={sizes}
        className={cn('h-full w-full object-cover', className)}
        style={
          blurDataUrl
            ? {
                backgroundImage: `url(${blurDataUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />
    </picture>
  );
}
