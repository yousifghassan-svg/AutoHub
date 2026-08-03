/** Shared description helpers for listing create/edit (all domains). */

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

/** Inverse of withNegotiableDescription for edit hydrate. */
export function parseNegotiableDescription(description: string): {
  description: string;
  negotiable: boolean;
} {
  const raw = description ?? '';
  const negotiable = raw.includes(NEGOTIABLE_NOTE);
  if (!negotiable) {
    return { description: raw.trim(), negotiable: false };
  }
  return {
    description: raw
      .replace(/\n\nPrice is negotiable\./g, '')
      .replace(/Price is negotiable\./g, '')
      .trim(),
    negotiable: true,
  };
}
