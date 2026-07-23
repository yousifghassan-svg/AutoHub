export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function uniqueSlug(base: string, suffix?: string): string {
  const root = slugify(base) || 'listing';
  const end = suffix ?? Date.now().toString(36);
  return `${root}-${end}`;
}
