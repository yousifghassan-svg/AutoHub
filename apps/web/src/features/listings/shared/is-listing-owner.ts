export function isListingOwner(
  userId: string | null | undefined,
  sellerId: string | null | undefined,
): boolean {
  return Boolean(userId && sellerId && userId === sellerId);
}
