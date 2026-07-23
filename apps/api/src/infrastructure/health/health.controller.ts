import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { HealthStatus } from '@autohub/types';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';
import { R2StorageService } from '../storage/r2-storage.service';
import { Public } from '../../shared/decorators/public.decorator';

/**
 * Infrastructure health only — not a business domain endpoint.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly firebase: FirebaseAuthService,
    private readonly r2: R2StorageService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Infrastructure health check' })
  async check(): Promise<
    HealthStatus & {
      integrations: {
        firebase: 'configured' | 'idle';
        r2: 'configured' | 'idle';
      };
    }
  > {
    let database: 'up' | 'down' = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    const redis: 'up' | 'down' | 'memory' =
      this.redis.mode === 'memory'
        ? 'memory'
        : (await this.redis.ping())
          ? 'up'
          : 'down';

    const checks: HealthStatus['checks'] = { database, redis };
    const status =
      database === 'up' && (redis === 'up' || redis === 'memory')
        ? 'ok'
        : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks,
      integrations: {
        firebase: this.firebase.isConfigured() ? 'configured' : 'idle',
        r2: this.r2.isConfigured() ? 'configured' : 'idle',
      },
    };
  }
}
