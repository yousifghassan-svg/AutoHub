import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { config, isFirebaseWebConfigured } from '../config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function matchesCurrentConfig(existing: FirebaseApp): boolean {
  const desired = config.firebase;
  return (
    existing.options.apiKey === desired.apiKey &&
    existing.options.projectId === desired.projectId &&
    existing.options.appId === desired.appId
  );
}

/**
 * Lazy Firebase App initialization (client-only).
 * Reads NEXT_PUBLIC_FIREBASE_* via `config.firebase`.
 *
 * Important: after switching .env projects, a prior default app can linger
 * (HMR / hot reload). Never reuse an app whose options don't match env.
 */
export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Web SDK can only be used in the browser');
  }
  if (!isFirebaseWebConfigured()) {
    throw new Error(
      'Firebase Web is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID (and preferably APP_ID / MESSAGING_SENDER_ID / STORAGE_BUCKET).',
    );
  }
  if (app && !matchesCurrentConfig(app)) {
    app = null;
    auth = null;
  }
  if (!app) {
    const existing = getApps().find((candidate) => matchesCurrentConfig(candidate));
    if (existing) {
      app = existing;
    } else if (getApps().length === 0) {
      app = initializeApp(config.firebase);
    } else {
      // Default app exists but belongs to a previous env — use a named app.
      const name = `autohub-${config.firebase.projectId}`;
      app =
        getApps().find((candidate) => candidate.name === name) ??
        initializeApp(config.firebase, name);
    }
    auth = getAuth(app);
    if (config.firebasePhoneTesting) {
      // Required for Firebase Auth test phone numbers without interactive reCAPTCHA.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (auth.settings as { appVerificationDisabledForTesting?: boolean }).appVerificationDisabledForTesting =
        true;
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  getFirebaseApp();
  return auth!;
}
