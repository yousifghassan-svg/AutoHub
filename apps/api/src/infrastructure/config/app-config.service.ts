import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getNodeEnv } from '@autohub/config';
import { isNonEmptyString } from '@autohub/utils';
import type { EnvConfig } from '../../config/env.validation';

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
      allowStaffDevLogin: (() => {
        const flag = this.config.get('ALLOW_STAFF_DEV_LOGIN', { infer: true });
        if (flag === true) return true;
        if (flag === false) return false;
        return this.config.get('NODE_ENV', { infer: true }) !== 'production';
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
