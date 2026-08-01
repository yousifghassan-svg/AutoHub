/**
 * Admin auth modes (Release 0.2).
 * - staff: POST /v1/auth/staff-login (development/staging only)
 * - firebase: reserved for future staff Firebase login
 *
 * Production builds must not use staff (build fails closed).
 */

export type AdminAuthMode = 'staff' | 'firebase';

export function resolveAdminAuthMode(raw: string | undefined): AdminAuthMode {
  const value = (raw ?? 'staff').trim().toLowerCase();
  if (value === 'staff' || value === 'firebase') return value;
  if (value === 'api') {
    if (typeof console !== 'undefined') {
      console.warn(
        '[autohub] NEXT_PUBLIC_AUTH_MODE=api on admin is deprecated; use firebase.',
      );
    }
    return 'firebase';
  }
  throw new Error(
    `Invalid NEXT_PUBLIC_AUTH_MODE="${raw}". Expected staff or firebase.`,
  );
}

/**
 * Runtime guard for production browser bundles.
 * Build-time enforcement lives in assert-production-auth.ts (next build only).
 */
export function assertAdminProductionAuthMode(mode: AdminAuthMode): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (mode === 'staff') {
    throw new Error(
      'Production admin must not use NEXT_PUBLIC_AUTH_MODE=staff. Staff login is development/staging only.',
    );
  }
}
