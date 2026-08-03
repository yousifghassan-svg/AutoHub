/**
 * Ordered READY asset ids for listing attach.
 * Primary (cover) is always first — matches ListingMedia sortOrder 0.
 * Listing-generic: vehicles, plates, equipment, and future types share this order contract.
 */
export function orderedReadyAssetIds(
  files: Array<{
    asset?: { id: string } | null;
    isPrimary?: boolean;
    status?: string;
  }>,
): string[] {
  const ready = files.filter(
    (f) =>
      Boolean(f.asset?.id) &&
      (f.status === undefined || f.status === 'done'),
  );
  if (!ready.length) return [];

  const primaryIdx = ready.findIndex((f) => f.isPrimary);
  if (primaryIdx <= 0) {
    return ready.map((f) => f.asset!.id);
  }

  const ordered = [...ready];
  const [primary] = ordered.splice(primaryIdx, 1);
  if (!primary?.asset) return ready.map((f) => f.asset!.id);
  return [primary.asset.id, ...ordered.map((f) => f.asset!.id)];
}
