/**
 * Shared configuration helpers for AutoHub apps.
 * Env parsing for API lives here; clients use their own NEXT_PUBLIC_/EXPO_PUBLIC_ vars.
 */

export const APP_NAME = 'AutoHub';

export const DEFAULT_API_PORT = 4000;
export const DEFAULT_WEB_PORT = 3000;
export const DEFAULT_ADMIN_PORT = 3001;

export const SUPPORTED_LOCALES = ['ar', 'ku', 'en'] as const;
export const DEFAULT_LOCALE = 'ar' as const;
export const SUPPORTED_CURRENCIES = ['IQD', 'USD'] as const;
export const DEFAULT_CURRENCY = 'IQD' as const;

export type NodeEnv = 'development' | 'test' | 'production';

export function getNodeEnv(value = process.env.NODE_ENV): NodeEnv {
  if (value === 'production' || value === 'test') return value;
  return 'development';
}
