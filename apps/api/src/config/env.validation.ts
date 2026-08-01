import { z } from 'zod';

const DEV_JWT_PLACEHOLDER = 'dev-only-access-secret-change-me';

/**
 * Runtime environment schema for the API process.
 * Optional integration vars are accepted so Firebase/R2 can be wired later
 * without blocking local foundation boot — except in production, where auth
 * secrets and Firebase Admin are required (Release 0.2 Phase A).
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().optional(),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),

  THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),

  JWT_ACCESS_SECRET: z.string().min(16).default(DEV_JWT_PLACEHOLDER),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),

  /**
   * Enables POST /v1/auth/staff-login outside production.
   * Forced false when NODE_ENV=production (cannot override).
   */
  AUTH_ALLOW_STAFF_LOGIN: z
    .enum(['true', 'false'])
    .optional()
    .transform((v): boolean | undefined =>
      v === undefined ? undefined : v === 'true',
    ),

  /**
   * Enables POST /v1/auth/dev-login outside production.
   * Forced false when NODE_ENV=production (cannot override).
   */
  AUTH_ALLOW_DEV_LOGIN: z
    .enum(['true', 'false'])
    .optional()
    .transform((v): boolean | undefined =>
      v === undefined ? undefined : v === 'true',
    ),

  /**
   * @deprecated Release 0.2 dual-read only. Prefer AUTH_ALLOW_STAFF_LOGIN + AUTH_ALLOW_DEV_LOGIN.
   * Removed in Release 0.3. When set, applies to both staff and dev login unless the new flags override.
   */
  ALLOW_STAFF_DEV_LOGIN: z
    .enum(['true', 'false'])
    .optional()
    .transform((v): boolean | undefined =>
      v === undefined ? undefined : v === 'true',
    ),

  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function assertProductionAuthHardening(data: EnvConfig): void {
  if (data.NODE_ENV !== 'production') return;

  if (
    data.JWT_ACCESS_SECRET === DEV_JWT_PLACEHOLDER ||
    data.JWT_ACCESS_SECRET.length < 32
  ) {
    throw new Error(
      'Environment validation failed: JWT_ACCESS_SECRET must be a strong secret ' +
        '(min 32 chars, not the development placeholder) when NODE_ENV=production',
    );
  }

  const firebaseReady =
    Boolean(data.FIREBASE_PROJECT_ID?.trim()) &&
    Boolean(data.FIREBASE_CLIENT_EMAIL?.trim()) &&
    Boolean(data.FIREBASE_PRIVATE_KEY?.trim());

  if (!firebaseReady) {
    throw new Error(
      'Environment validation failed: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
        'and FIREBASE_PRIVATE_KEY are required when NODE_ENV=production',
    );
  }
}

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Environment validation failed: ${details}`);
  }
  assertProductionAuthHardening(parsed.data);
  return parsed.data;
}
