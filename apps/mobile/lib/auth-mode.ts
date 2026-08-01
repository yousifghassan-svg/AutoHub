/**
 * Mobile auth modes (Release 0.2).
 * - firebase: Firebase phone OTP → POST /v1/auth/login
 * - dev: OTP UX → POST /v1/auth/dev-login (API required; no offline tokens)
 *
 * Legacy aliases: api → firebase, mock → dev
 */

export type MobileAuthMode = 'firebase' | 'dev';

function readEnv(key: string): string | undefined {
  return process.env[key];
}

export function resolveMobileAuthMode(raw: string | undefined): MobileAuthMode {
  const value = (raw ?? '').trim().toLowerCase();
  if (!value) {
    return readEnv('EXPO_PUBLIC_FIREBASE_API_KEY') ? 'firebase' : 'dev';
  }
  if (value === 'firebase' || value === 'api') {
    if (value === 'api' && typeof console !== 'undefined') {
      console.warn(
        '[autohub] EXPO_PUBLIC_AUTH_MODE=api is deprecated; use firebase.',
      );
    }
    return 'firebase';
  }
  if (value === 'dev' || value === 'mock') {
    if (value === 'mock' && typeof console !== 'undefined') {
      console.warn(
        '[autohub] EXPO_PUBLIC_AUTH_MODE=mock is deprecated; use dev.',
      );
    }
    return 'dev';
  }
  throw new Error(
    `Invalid EXPO_PUBLIC_AUTH_MODE="${raw}". Expected firebase or dev.`,
  );
}

export function assertMobileProductionAuthMode(mode: MobileAuthMode): void {
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.EAS_BUILD_PROFILE === 'production';
  if (!isProd) return;
  if (mode !== 'firebase') {
    throw new Error(
      'Production mobile builds require EXPO_PUBLIC_AUTH_MODE=firebase (dev/mock auth is forbidden).',
    );
  }
}
