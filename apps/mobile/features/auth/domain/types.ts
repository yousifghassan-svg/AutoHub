import type { AuthenticatedUser, AuthTokens } from '@/lib/api/types';

export type { AuthenticatedUser, AuthTokens };

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  /** epoch ms when access token should be considered expired */
  accessExpiresAt: number;
  user: AuthenticatedUser;
  /** Local flag — profile setup completed on device */
  profileSetupComplete: boolean;
};

export type PhoneVerificationSession = {
  verificationId: string;
  phoneE164: string;
};

export type AuthStatus =
  | 'bootstrapping'
  | 'unauthenticated'
  | 'needs_profile'
  | 'authenticated';
