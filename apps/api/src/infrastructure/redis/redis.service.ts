import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';
import { AppLoggerService } from '../logger/app-logger.service';

export type RedisMode = 'redis' | 'memory';

/**
 * Redis client facade with in-memory fallback when REDIS_URL is unset.
 * Prepared for rate-limit storage, caches, and queues in later sprints.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly memory = new Map<string, { value: string; expiresAt?: number }>();
  private client: Redis | null = null;
  readonly mode: RedisMode;

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(RedisService.name);
    const { redisUrl } = this.appConfig.app;

    if (!redisUrl) {
      this.mode = 'memory';
      this.logger.warn('REDIS_URL missing — using in-memory store');
      return;
    }

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      lazyConnect: false,
    });
    this.mode = 'redis';
    this.logger.log('Redis client initialized');
  }

  async get(key: string): Promise<string | null> {
    if (this.client) return this.client.get(key);

    const entry = this.memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      if (ttlSeconds) await this.client.set(key, value, 'EX', ttlSeconds);
      else await this.client.set(key, value);
      return;
    }

    this.memory.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async ping(): Promise<boolean> {
    if (!this.client) return true;

    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) await this.client.quit();
  }
}
