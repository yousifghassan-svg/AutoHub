import {
  assertWebProductionAuthMode,
  resolveWebAuthMode,
  type WebAuthMode,
} from './auth-mode';

const authMode: WebAuthMode = resolveWebAuthMode(
  process.env.NEXT_PUBLIC_AUTH_MODE,
);
assertWebProductionAuthMode(authMode);

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId: string;
  storageBucket: string;
};

const firebase: FirebaseWebConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
};

/** Minimum fields required to initialize the Firebase Web SDK for phone auth. */
export function isFirebaseWebConfigured(): boolean {
  return Boolean(
    firebase.apiKey.trim() &&
      firebase.authDomain.trim() &&
      firebase.projectId.trim(),
  );
}

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
  /**
   * When true, disables reCAPTCHA app verification for Firebase phone auth.
   * Only valid with Firebase Console "Phone numbers for testing".
   * Never enable in production builds.
   */
  firebasePhoneTesting:
    process.env.NEXT_PUBLIC_FIREBASE_PHONE_TESTING === 'true' &&
    process.env.NODE_ENV !== 'production',
  firebase,
};
