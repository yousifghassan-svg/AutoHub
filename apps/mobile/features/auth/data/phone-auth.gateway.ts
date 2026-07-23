import type { PhoneVerificationSession } from '../domain/types';

export type PhoneAuthGateway = {
  sendOtp(phoneE164: string): Promise<PhoneVerificationSession>;
  confirmOtp(session: PhoneVerificationSession, code: string): Promise<{ idToken: string }>;
  updateDisplayName?(displayName: string): Promise<void>;
};

export class PhoneAuthError extends Error {
  constructor(
    message: string,
    readonly code: 'INVALID_PHONE' | 'INVALID_CODE' | 'RATE_LIMIT' | 'UNAVAILABLE' | 'UNKNOWN' = 'UNKNOWN',
  ) {
    super(message);
    this.name = 'PhoneAuthError';
  }
}
