import {
  assertWebProductionAuthMode,
  resolveWebAuthMode,
  type WebAuthMode,
} from './auth-mode';

const authMode: WebAuthMode = resolveWebAuthMode(
  process.env.NEXT_PUBLIC_AUTH_MODE,
);
assertWebProductionAuthMode(authMode);

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  mediaPublicBaseUrl: process.env.NEXT_PUBLIC_MEDIA_PUBLIC_BASE_URL ?? '',
  /**
   * firebase = Firebase idToken → Nest login.
   * dev = OTP UX → Nest /v1/auth/dev-login (requires API; no offline tokens).
   */
  authMode,
  /** OTP accepted only when authMode=dev */
  authDevOtp: process.env.NEXT_PUBLIC_AUTH_DEV_OTP ?? '123456',
};
