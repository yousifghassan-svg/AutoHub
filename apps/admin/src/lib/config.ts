export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  webUrl: process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000',
  /** staff = phone dev login (POST /v1/auth/staff-login). api = Firebase idToken login. */
  authMode: (process.env.NEXT_PUBLIC_AUTH_MODE ?? 'staff') as 'staff' | 'api',
};
