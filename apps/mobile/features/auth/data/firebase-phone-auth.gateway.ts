import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithCredential,
  PhoneAuthProvider,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import { config, isFirebaseConfigured } from '@/lib/config';
import type { PhoneAuthGateway } from './phone-auth.gateway';
import { PhoneAuthError } from './phone-auth.gateway';

/**
 * Firebase Auth phone gateway.
 *
 * Note: `signInWithPhoneNumber` requires a Recaptcha / ApplicationVerifier.
 * On native Expo builds, wire an ApplicationVerifier (or use a custom native module).
 * Until then, prefer mock mode in Expo Go, or inject verificationId via test harness.
 *
 * This gateway exposes `confirmWithVerificationId` path used after SMS is sent
 * by a platform-specific sender (see `sendOtp` stub that throws with guidance).
 */
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new PhoneAuthError('Firebase is not configured', 'UNAVAILABLE');
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(config.firebase);
    auth = getAuth(app);
  }
  return auth!;
}

export function createFirebasePhoneAuthGateway(deps?: {
  /** Optional: platform-specific SMS sender returning verificationId */
  sendSms?: (phoneE164: string) => Promise<string>;
}): PhoneAuthGateway {
  return {
    async sendOtp(phoneE164) {
      if (deps?.sendSms) {
        const verificationId = await deps.sendSms(phoneE164);
        return { verificationId, phoneE164 };
      }
      throw new PhoneAuthError(
        'Firebase phone SMS sender is not configured for this build. Use mock auth mode or provide a native ApplicationVerifier.',
        'UNAVAILABLE',
      );
    },
    async confirmOtp(session, code) {
      try {
        const credential = PhoneAuthProvider.credential(session.verificationId, code);
        const result = await signInWithCredential(getFirebaseAuth(), credential);
        const idToken = await result.user.getIdToken(true);
        return { idToken };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Invalid verification code';
        throw new PhoneAuthError(message, 'INVALID_CODE');
      }
    },
    async updateDisplayName(displayName) {
      const current = getFirebaseAuth().currentUser;
      if (current) {
        await updateProfile(current, { displayName });
      }
    },
  };
}
