import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { MediaController } from './media.controller';
import { MediaService } from '../application/media.service';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { PermissionsGuard } from '../../auth/presentation/guards/permissions.guard';
import { AppConfigService } from '../../../infrastructure/config/app-config.service';
import { UsersService } from '../../users/application/users.service';
import { permissionsForRole } from '../../auth/domain/permissions';
import { ResponseInterceptor } from '../../../shared/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../../../shared/filters/all-exceptions.filter';

describe('Media HTTP integration', () => {
  let app: INestApplication;
  let accessToken: string;

  const mediaService = {
    presign: jest.fn(),
    upload: jest.fn(),
    complete: jest.fn(),
    getById: jest.fn(),
    delete: jest.fn(),
  };

  const user = {
    id: 'user-1',
    firebaseUid: 'fb',
    phone: '+9647700000000',
    email: null,
    displayName: 'Uploader',
    role: 'USER' as const,
    status: 'ACTIVE',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        { provide: MediaService, useValue: mediaService },
        JwtService,
        {
          provide: AppConfigService,
          useValue: {
            app: { jwt: { accessSecret: 'media-integration-secret', accessTtlSeconds: 900 } },
          },
        },
        {
          provide: UsersService,
          useValue: {
            findActiveById: jest.fn(async (id: string) => (id === user.id ? user : null)),
          },
        },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    accessToken = await app.get(JwtService).signAsync(
      { sub: user.id, role: user.role, permissions: permissionsForRole(user.role) },
      { secret: 'media-integration-secret', expiresIn: 900 },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('POST /v1/media/presign', async () => {
    mediaService.presign.mockResolvedValue({
      asset: { id: 'a1' },
      upload: { mode: 'signed_url', url: 'https://r2/upload' },
    });

    await request(app.getHttpServer())
      .post('/v1/media/presign')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        mediaType: 'IMAGE',
        mimeType: 'image/jpeg',
        byteSize: 1024,
        filename: 'a.jpg',
      })
      .expect(201);
  });

  it('POST /v1/media/complete', async () => {
    mediaService.complete.mockResolvedValue({ id: 'a1', status: 'READY' });

    await request(app.getHttpServer())
      .post('/v1/media/complete')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ mediaId: 'a1', fileBase64: Buffer.from('jpeg').toString('base64') })
      .expect(201);
  });

  it('GET /v1/media/:id', async () => {
    mediaService.getById.mockResolvedValue({ id: 'a1', visibility: 'PUBLIC' });

    await request(app.getHttpServer())
      .get('/v1/media/a1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('DELETE /v1/media/:id', async () => {
    mediaService.delete.mockResolvedValue({ success: true });

    await request(app.getHttpServer())
      .delete('/v1/media/a1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
