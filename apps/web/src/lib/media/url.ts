import { config } from '../config';

export function mediaPublicUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key;
  const base = config.mediaPublicBaseUrl;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

/** Placeholder when CDN is not configured. */
export function listingImageSrc(url: string | null | undefined, seed: string): string {
  if (url) return url;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
}
