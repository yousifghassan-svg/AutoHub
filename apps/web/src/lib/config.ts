export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  mediaPublicBaseUrl: process.env.NEXT_PUBLIC_MEDIA_PUBLIC_BASE_URL ?? '',
  /** mock = local OTP session (Expo-compatible). api = Firebase idToken → Nest login. */
  authMode: (process.env.NEXT_PUBLIC_AUTH_MODE ?? 'mock') as 'mock' | 'api',
  mockOtpCode: process.env.NEXT_PUBLIC_MOCK_OTP ?? '123456',
};
