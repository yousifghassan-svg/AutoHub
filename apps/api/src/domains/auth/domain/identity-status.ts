export type IdentityStatus =
  | 'unauthenticated'
  | 'needs_profile'
  | 'authenticated';

/** Server-side profile completeness for an authenticated user row. */
export function isProfileComplete(user: {
  displayName: string | null;
  cityId: string | null;
}): boolean {
  const name = user.displayName?.trim() ?? '';
  return name.length >= 2 && Boolean(user.cityId);
}

/**
 * Identity status for an authenticated user.
 * `unauthenticated` is reserved for clients with no session (never returned by /auth/me).
 */
export function identityStatusForUser(user: {
  displayName: string | null;
  cityId: string | null;
}): Exclude<IdentityStatus, 'unauthenticated'> {
  return isProfileComplete(user) ? 'authenticated' : 'needs_profile';
}
