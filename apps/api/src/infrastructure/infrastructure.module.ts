import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { LoggerModule } from './logger/logger.module';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis/redis.module';
import { FirebaseModule } from './firebase/firebase.module';
import { R2Module } from './storage/r2.module';
import { HealthModule } from './health/health.module';

/**
 * Aggregates shared infrastructure adapters.
 * Domain modules import AppModule composition; they do not own infra clients.
 */
@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    PrismaModule,
    RedisModule,
    FirebaseModule,
    R2Module,
    HealthModule,
  ],
})
export class InfrastructureModule {}
