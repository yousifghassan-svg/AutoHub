import { config } from '@/lib/config';
import type { PhoneAuthGateway } from './phone-auth.gateway';
import { PhoneAuthError } from './phone-auth.gateway';

/**
 * Dev gateway: any E.164 phone, OTP = config.authDevOtp.
 * Used with createDevAuthRepository → POST /v1/auth/dev-login (no offline tokens).
 */
export function createMockPhoneAuthGateway(): PhoneAuthGateway {
  let lastDisplayName: string | null = null;

  return {
    async sendOtp(phoneE164) {
      if (!/^\+[1-9]\d{7,14}$/.test(phoneE164)) {
        throw new PhoneAuthError('Invalid phone number', 'INVALID_PHONE');
      }
      return {
        verificationId: `dev-verification:${phoneE164}`,
        phoneE164,
      };
    },
    async confirmOtp(session, code) {
      if (code !== config.authDevOtp) {
        throw new PhoneAuthError('Invalid verification code', 'INVALID_CODE');
      }
      const idToken = [
        'dev',
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
