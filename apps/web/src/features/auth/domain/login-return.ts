import { safeNextPath } from './safe-next-path';

/** Build `/path?next=…` using only safe same-origin relative targets. */
export function hrefWithNext(
  basePath: string,
  next: string | null | undefined,
): string {
  const safe = safeNextPath(next);
  if (!safe) return basePath;
  const join = basePath.includes('?') ? '&' : '?';
  return `${basePath}${join}next=${encodeURIComponent(safe)}`;
}

/** Post-auth destination: safe `next` or fallback. */
export function resolveLoginReturn(
  next: string | null | undefined,
  fallback = '/',
): string {
  return safeNextPath(next) ?? fallback;
}
