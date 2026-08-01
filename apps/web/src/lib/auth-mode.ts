/**
 * Web auth modes (Release 0.2).
 * - firebase: Firebase phone OTP → POST /v1/auth/login
 * - dev: local OTP UX → POST /v1/auth/dev-login (non-production API only)
 *
 * Legacy aliases (deprecated): api → firebase, mock → dev
 */

export type WebAuthMode = 'firebase' | 'dev';

export function resolveWebAuthMode(raw: string | undefined): WebAuthMode {
  const value = (raw ?? 'dev').trim().toLowerCase();
  if (value === 'firebase' || value === 'api') {
    if (value === 'api' && typeof console !== 'undefined') {
      console.warn(
        '[autohub] NEXT_PUBLIC_AUTH_MODE=api is deprecated; use firebase. Alias removed in a future release.',
      );
    }
    return 'firebase';
  }
  if (value === 'dev' || value === 'mock') {
    if (value === 'mock' && typeof console !== 'undefined') {
      console.warn(
        '[autohub] NEXT_PUBLIC_AUTH_MODE=mock is deprecated; use dev. Alias removed in a future release.',
      );
    }
    return 'dev';
  }
  throw new Error(
    `Invalid NEXT_PUBLIC_AUTH_MODE="${raw}". Expected firebase or dev.`,
  );
}

/**
 * Runtime guard for production browser bundles.
 * Build-time enforcement lives in assert-production-auth.ts (next build only).
 */
export function assertWebProductionAuthMode(mode: WebAuthMode): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (mode !== 'firebase') {
    throw new Error(
      'Production web requires NEXT_PUBLIC_AUTH_MODE=firebase (dev/mock auth is forbidden).',
    );
  }
}
