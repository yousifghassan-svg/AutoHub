import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './infrastructure/config/app-config.service';
import { AppLoggerService } from './infrastructure/logger/app-logger.service';
import { setupSwagger } from './infrastructure/swagger/swagger.setup';
import { createValidationPipe } from './shared/pipes/validation.pipe';
import { REQUEST_ID_HEADER, CORRELATION_ID_HEADER } from './shared/constants/injection-tokens';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // AppLoggerService is TRANSIENT (per-injector context); resolve() required at bootstrap.
  const appLogger = await app.resolve(AppLoggerService);
  appLogger.setContext('Bootstrap');
  app.useLogger(appLogger);

  const appConfig = app.get(AppConfigService);
  const { port, corsOrigins, nodeEnv } = appConfig.app;

  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    exposedHeaders: [REQUEST_ID_HEADER, CORRELATION_ID_HEADER],
  });

  app.useGlobalPipes(createValidationPipe());
  app.setGlobalPrefix('v1');

  setupSwagger(app);

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`AutoHub API listening on http://localhost:${port}/v1`);
  logger.log(`OpenAPI docs at http://localhost:${port}/docs`);
  logger.log(`OpenAPI JSON at http://localhost:${port}/docs/json`);
}

bootstrap();
