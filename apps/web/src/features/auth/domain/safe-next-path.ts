/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative (`//evil.com`) and absolute URLs.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const path = raw.trim();
  if (!path.startsWith('/')) return null;
  if (path.startsWith('//')) return null;
  if (path.includes('\\')) return null;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)) return null;
  return path;
}
