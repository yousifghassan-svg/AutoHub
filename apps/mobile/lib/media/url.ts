import { config } from '../config';

/** Build a public CDN URL from an R2 object key (listings return keys, not URLs). */
export function mediaPublicUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key;
  const base = config.mediaPublicBaseUrl;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}
