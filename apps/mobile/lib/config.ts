export type AuthMode = 'api' | 'mock';

function readEnv(key: keyof NodeJS.ProcessEnv): string | undefined {
  return process.env[key];
}

export const config = {
  apiUrl: (readEnv('EXPO_PUBLIC_API_URL') ?? 'http://localhost:4000').replace(/\/$/, ''),
  /** Public R2 / CDN base for listing image keys */
  mediaPublicBaseUrl: (readEnv('EXPO_PUBLIC_MEDIA_BASE_URL') ?? '').replace(/\/$/, ''),
  authMode: (readEnv('EXPO_PUBLIC_AUTH_MODE') as AuthMode | undefined) ??
    (readEnv('EXPO_PUBLIC_FIREBASE_API_KEY') ? 'api' : 'mock'),
  firebase: {
    apiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY') ?? '',
    authDomain: readEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN') ?? '',
    projectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID') ?? '',
  },
  /** Dev OTP accepted by mock phone gateway */
  mockOtpCode: '123456',
} as const;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    config.firebase.apiKey && config.firebase.authDomain && config.firebase.projectId,
  );
}
