import type { AuthenticatedUser } from '@/lib/api/types';

export type AuthStatus =
  | 'bootstrapping'
  | 'unauthenticated'
  | 'needs_profile'
  | 'authenticated';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  user: AuthenticatedUser;
  profileSetupComplete: boolean;
};

export type PhoneVerificationSession = {
  phoneE164: string;
  verificationId: string;
};
