/** Shared description helpers for listing create (all domains). */

const NEGOTIABLE_NOTE = 'Price is negotiable.';

export function withNegotiableDescription(
  description: string,
  negotiable: boolean,
): string {
  const base = description.trim();
  if (!negotiable) return base;
  if (base.includes(NEGOTIABLE_NOTE)) return base;
  return base ? `${base}\n\n${NEGOTIABLE_NOTE}` : NEGOTIABLE_NOTE;
}
