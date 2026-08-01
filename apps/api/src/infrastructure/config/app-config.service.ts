import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getNodeEnv } from '@autohub/config';
import { isNonEmptyString } from '@autohub/utils';
import type { EnvConfig } from '../../config/env.validation';
import { resolveAuthLoginFlags } from './auth-login-flags';

export interface AppRuntimeConfig {
  nodeEnv: ReturnType<typeof getNodeEnv>;
  port: number;
  databaseUrl: string;
  redisUrl?: string;
  corsOrigins: string[];
  throttle: { ttlMs: number; limit: number };
  jwt: {
    accessSecret: string;
    accessTtlSeconds: number;
    refreshTtlSeconds: number;
  };
  /** Staff phone login (`/v1/auth/staff-login`). Always false in production. */
  allowStaffLogin: boolean;
  /** Consumer dev login (`/v1/auth/dev-login`). Always false in production. */
  allowDevLogin: boolean;
  /**
   * @deprecated Use allowStaffLogin / allowDevLogin. Kept for Release 0.2 callers; removed in 0.3.
   * True only when both staff and dev login are enabled.
   */
  allowStaffDevLogin: boolean;
  firebase: {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
  };
  r2: {
    accountId?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    publicBaseUrl?: string;
    endpoint?: string;
  };
}

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvConfig, true>) {}

  get app(): AppRuntimeConfig {
    const redisUrl = this.config.get('REDIS_URL', { infer: true });
    const privateKeyRaw = this.config.get('FIREBASE_PRIVATE_KEY', { infer: true });

    return {
      nodeEnv: getNodeEnv(this.config.get('NODE_ENV', { infer: true })),
      port: this.config.get('PORT', { infer: true }),
      databaseUrl: this.config.get('DATABASE_URL', { infer: true }),
      redisUrl: isNonEmptyString(redisUrl) ? redisUrl : undefined,
      corsOrigins: this.config
        .get('CORS_ORIGINS', { infer: true })
        .split(',')
        .map((origin) => origin.trim())
        .filter(isNonEmptyString),
      throttle: {
        ttlMs: this.config.get('THROTTLE_TTL_MS', { infer: true }),
        limit: this.config.get('THROTTLE_LIMIT', { infer: true }),
      },
      jwt: {
        accessSecret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        accessTtlSeconds: this.config.get('JWT_ACCESS_TTL_SECONDS', { infer: true }),
        refreshTtlSeconds: this.config.get('JWT_REFRESH_TTL_SECONDS', { infer: true }),
      },
      ...(() => {
        const nodeEnv = this.config.get('NODE_ENV', { infer: true });
        const flags = resolveAuthLoginFlags({
          nodeEnv,
          authAllowStaffLogin: this.config.get('AUTH_ALLOW_STAFF_LOGIN', {
            infer: true,
          }),
          authAllowDevLogin: this.config.get('AUTH_ALLOW_DEV_LOGIN', {
            infer: true,
          }),
          allowStaffDevLogin: this.config.get('ALLOW_STAFF_DEV_LOGIN', {
            infer: true,
          }),
        });
        return {
          allowStaffLogin: flags.allowStaffLogin,
          allowDevLogin: flags.allowDevLogin,
          allowStaffDevLogin: flags.allowStaffLogin && flags.allowDevLogin,
        };
      })(),
      firebase: {
        projectId: emptyToUndefined(this.config.get('FIREBASE_PROJECT_ID', { infer: true })),
        clientEmail: emptyToUndefined(
          this.config.get('FIREBASE_CLIENT_EMAIL', { infer: true }),
        ),
        privateKey: emptyToUndefined(privateKeyRaw)?.replace(/\\n/g, '\n'),
      },
      r2: {
        accountId: emptyToUndefined(this.config.get('R2_ACCOUNT_ID', { infer: true })),
        accessKeyId: emptyToUndefined(this.config.get('R2_ACCESS_KEY_ID', { infer: true })),
        secretAccessKey: emptyToUndefined(
          this.config.get('R2_SECRET_ACCESS_KEY', { infer: true }),
        ),
        bucket: emptyToUndefined(this.config.get('R2_BUCKET', { infer: true })),
        publicBaseUrl: emptyToUndefined(
          this.config.get('R2_PUBLIC_BASE_URL', { infer: true }),
        ),
        endpoint: emptyToUndefined(this.config.get('R2_ENDPOINT', { infer: true })),
      },
    };
  }
}

function emptyToUndefined(value?: string): string | undefined {
  return isNonEmptyString(value) ? value : undefined;
}
