/** Generate a client-local draft id (not a server Listing id). */
export function newListingDraftLocalId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `ld_${Date.now().toString(36)}_${rand}`;
}
