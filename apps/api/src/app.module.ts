import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DomainsModule } from './domains/domains.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AppConfigService } from './infrastructure/config/app-config.service';
import { SharedModule } from './shared/shared.module';
import { RequestIdMiddleware } from './shared/middleware/request-id.middleware';

@Module({
  imports: [
    SharedModule,
    InfrastructureModule,
    DomainsModule,
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService) => [
        {
          ttl: appConfig.app.throttle.ttlMs,
          limit: appConfig.app.throttle.limit,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
