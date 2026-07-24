const MAX_ENTRIES = 128;

const cache = new Map<string, string>();

export function getCachedSvg(key: string): string | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

export function setCachedSvg(key: string, svg: string): string {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, svg);
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  return svg;
}
