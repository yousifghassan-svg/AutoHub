import {
  assertMobileProductionAuthMode,
  resolveMobileAuthMode,
  type MobileAuthMode,
} from './auth-mode';

function readEnv(key: keyof NodeJS.ProcessEnv): string | undefined {
  return process.env[key];
}

const authMode: MobileAuthMode = resolveMobileAuthMode(
  readEnv('EXPO_PUBLIC_AUTH_MODE'),
);
assertMobileProductionAuthMode(authMode);

export type AuthMode = MobileAuthMode;

export const config = {
  apiUrl: (readEnv('EXPO_PUBLIC_API_URL') ?? 'http://localhost:4000').replace(
    /\/$/,
    '',
  ),
  /** Public R2 / CDN base for listing image keys */
  mediaPublicBaseUrl: (readEnv('EXPO_PUBLIC_MEDIA_BASE_URL') ?? '').replace(
    /\/$/,
    '',
  ),
  authMode,
  firebase: {
    apiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY') ?? '',
    authDomain: readEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN') ?? '',
    projectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID') ?? '',
  },
  /** OTP accepted only when authMode=dev */
  authDevOtp: readEnv('EXPO_PUBLIC_AUTH_DEV_OTP') ?? '123456',
  /** @deprecated Use authDevOtp */
  mockOtpCode: readEnv('EXPO_PUBLIC_AUTH_DEV_OTP') ?? '123456',
} as const;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    config.firebase.apiKey &&
      config.firebase.authDomain &&
      config.firebase.projectId,
  );
}
