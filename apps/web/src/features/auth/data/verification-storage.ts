import type { PhoneVerificationSession } from '../domain/types';

const KEY = 'autohub.web.phone-verification';

export function saveVerification(session: PhoneVerificationSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function loadVerification(): PhoneVerificationSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PhoneVerificationSession;
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}

export function clearVerification(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}
