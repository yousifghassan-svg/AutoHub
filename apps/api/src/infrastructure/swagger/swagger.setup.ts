import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * OpenAPI / Swagger document setup.
 */
export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AutoHub API')
    .setDescription(
      [
        'AutoHub REST API — Sprint 6 Media Platform.',
        '',
        '## Media',
        'Module-agnostic Cloudflare R2 media service under `/v1/media/*`.',
        'Supports IMAGE, VIDEO, MEDIA_360, DOCUMENT with signed uploads and processing.',
        '',
        '## Search / Listings / Auth',
        'See `/search`, `/listings`, and `/auth` tags.',
      ].join('\n'),
    )
    .setVersion('0.6.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'AutoHub JWT access token (issued by /auth/login)',
      },
      'access-token',
    )
    .addTag('health', 'Infrastructure health')
    .addTag('auth', 'Authentication & identity')
    .addTag('listings', 'Listing lifecycle, media, and search')
    .addTag('search', 'Search & discovery engine')
    .addTag('media', 'Enterprise media platform (R2)')
    .addServer('/v1', 'Versioned API')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: false,
    jsonDocumentUrl: 'docs/json',
    yamlDocumentUrl: 'docs/yaml',
  });
}
