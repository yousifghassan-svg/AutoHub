import {
  assertAdminProductionAuthMode,
  resolveAdminAuthMode,
  type AdminAuthMode,
} from './auth-mode';

const authMode: AdminAuthMode = resolveAdminAuthMode(
  process.env.NEXT_PUBLIC_AUTH_MODE,
);
assertAdminProductionAuthMode(authMode);

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  webUrl: process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000',
  /**
   * staff = phone → POST /v1/auth/staff-login (dev/staging only).
   * firebase = reserved (production builds require this mode once wired).
   */
  authMode,
};
