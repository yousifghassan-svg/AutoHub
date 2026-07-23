import { config } from '@/lib/config';
import type { PhoneAuthGateway } from './phone-auth.gateway';
import { PhoneAuthError } from './phone-auth.gateway';

/**
 * Dev / Story gateway: any E.164 phone, OTP = config.mockOtpCode (123456).
 * Produces a mock Firebase-shaped idToken string for the mock auth repository.
 */
export function createMockPhoneAuthGateway(): PhoneAuthGateway {
  let lastDisplayName: string | null = null;

  return {
    async sendOtp(phoneE164) {
      if (!/^\+[1-9]\d{7,14}$/.test(phoneE164)) {
        throw new PhoneAuthError('Invalid phone number', 'INVALID_PHONE');
      }
      return {
        verificationId: `mock-verification:${phoneE164}`,
        phoneE164,
      };
    },
    async confirmOtp(session, code) {
      if (code !== config.mockOtpCode) {
        throw new PhoneAuthError('Invalid verification code', 'INVALID_CODE');
      }
      const idToken = [
        'mock',
        session.phoneE164,
        lastDisplayName ?? '',
        Date.now().toString(36),
      ].join('|');
      return { idToken };
    },
    async updateDisplayName(displayName) {
      lastDisplayName = displayName;
    },
  };
}
