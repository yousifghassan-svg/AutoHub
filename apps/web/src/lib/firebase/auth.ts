import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

const RECAPTCHA_CONTAINER_ID = 'autohub-recaptcha';

/** In-memory ConfirmationResult keyed by Firebase verificationId (not serializable). */
const confirmations = new Map<string, ConfirmationResult>();

let recaptchaVerifier: RecaptchaVerifier | null = null;

function ensureRecaptchaContainer(): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('Phone verification requires a browser environment');
  }
  let el = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = RECAPTCHA_CONTAINER_ID;
    // Invisible reCAPTCHA must stay in the layout — display:none breaks token minting
    // and surfaces as auth/invalid-app-credential / INVALID_APP_CREDENTIAL.
    el.setAttribute('aria-hidden', 'true');
    el.style.position = 'fixed';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.padding = '0';
    el.style.margin = '-1px';
    el.style.overflow = 'hidden';
    el.style.clip = 'rect(0, 0, 0, 0)';
    el.style.whiteSpace = 'nowrap';
    el.style.border = '0';
    document.body.appendChild(el);
  }
  return el;
}

function clearRecaptcha(): void {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      /* ignore */
    }
    recaptchaVerifier = null;
  }
  const el = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (el) el.innerHTML = '';
}

function getRecaptchaVerifier(): RecaptchaVerifier {
  const auth = getFirebaseAuth();
  ensureRecaptchaContainer();
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
      size: 'invisible',
    });
  }
  return recaptchaVerifier;
}

function mapFirebaseAuthError(error: unknown): Error {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  const message =
    error instanceof Error ? error.message : 'Firebase phone authentication failed';

  switch (code) {
    case 'auth/invalid-phone-number':
      return new Error('Invalid phone number. Use E.164 format (e.g. +9647XXXXXXXXX).');
    case 'auth/too-many-requests':
      return new Error('Too many verification attempts. Try again later.');
    case 'auth/invalid-verification-code':
    case 'auth/code-expired':
      return new Error('Invalid or expired verification code.');
    case 'auth/missing-verification-code':
      return new Error('Enter the verification code from SMS.');
    case 'auth/captcha-check-failed':
    case 'auth/invalid-app-credential':
      return new Error(
        'reCAPTCHA verification failed. Check Firebase authorized domains and Web API key.',
      );
    case 'auth/quota-exceeded':
      return new Error('SMS quota exceeded for this Firebase project.');
    case 'auth/error-code':
    case 'auth/error-code:-39':
      // Identity Toolkit "Error code: 39" / backendError — SMS anti-abuse gate.
      return new Error(
        'Firebase could not deliver the SMS (backend error 39). Wait and retry, use a Firebase test phone number locally, or check Firebase Console SMS / Support for project autohub-v2-c039b.',
      );
    default:
      // SDK sometimes surfaces as auth/error-code with message "Firebase: Error (auth/error-code:-39)."
      if (/error-code:-39|Error code:\s*39/i.test(message) || /error-code:-39/i.test(code)) {
        return new Error(
          'Firebase could not deliver the SMS (backend error 39). Wait and retry, use a Firebase test phone number locally, or check Firebase Console SMS / Support for project autohub-v2-c039b.',
        );
      }
      return new Error(message);
  }
}

/**
 * Send SMS OTP via Firebase Phone Auth (`signInWithPhoneNumber`).
 */
export async function sendOtp(
  phoneE164: string,
): Promise<{ phoneE164: string; verificationId: string }> {
  try {
    const auth = getFirebaseAuth();
    const verifier = getRecaptchaVerifier();
    const confirmation = await signInWithPhoneNumber(auth, phoneE164, verifier);
    confirmations.set(confirmation.verificationId, confirmation);
    // Invisible verifier is single-use; recreate for resend.
    clearRecaptcha();
    return {
      phoneE164,
      verificationId: confirmation.verificationId,
    };
  } catch (error) {
    clearRecaptcha();
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Confirm SMS code → Firebase ID token for `POST /v1/auth/login`.
 */
export async function confirmOtp(verificationId: string, code: string): Promise<string> {
  const confirmation = confirmations.get(verificationId);
  if (!confirmation) {
    throw new Error('Verification expired. Request a new code.');
  }
  try {
    const result = await confirmation.confirm(code.trim());
    const idToken = await result.user.getIdToken(true);
    confirmations.delete(verificationId);
    return idToken;
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

export function clearPhoneConfirmations(): void {
  confirmations.clear();
  clearRecaptcha();
}
