import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { ListingStatus } from '@autohub/database';
import { ListingsController } from './listings.controller';
import { ListingsService } from '../application/listings.service';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { PermissionsGuard } from '../../auth/presentation/guards/permissions.guard';
import { AppConfigService } from '../../../infrastructure/config/app-config.service';
import { UsersService } from '../../users/application/users.service';
import { permissionsForRole } from '../../auth/domain/permissions';
import { ResponseInterceptor } from '../../../shared/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../../../shared/filters/all-exceptions.filter';

describe('Listings HTTP integration', () => {
  let app: INestApplication;
  let accessToken: string;

  const listingsService = {
    create: jest.fn(),
    search: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    addMedia: jest.fn(),
    removeMedia: jest.fn(),
    changeStatus: jest.fn(),
  };

  const user = {
    id: 'user-1',
    firebaseUid: 'fb',
    phone: '+9647700000000',
    email: null,
    displayName: 'Seller',
    role: 'USER' as const,
    status: 'ACTIVE',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [
        { provide: ListingsService, useValue: listingsService },
        JwtService,
        {
          provide: AppConfigService,
          useValue: {
            app: { jwt: { accessSecret: 'listings-integration-secret', accessTtlSeconds: 900 } },
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

    const jwt = app.get(JwtService);
    accessToken = await jwt.signAsync(
      {
        sub: user.id,
        role: user.role,
        permissions: permissionsForRole(user.role),
      },
      { secret: 'listings-integration-secret', expiresIn: 900 },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('POST /v1/listings creates draft', async () => {
    listingsService.create.mockResolvedValue({
      id: 'L1',
      status: ListingStatus.DRAFT,
      title: 'Camry',
    });

    const res = await request(app.getHttpServer())
      .post('/v1/listings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        categoryId: 'cat-1',
        cityId: 'city-1',
        title: 'Toyota Camry 2020',
        description: 'Clean car in Erbil, excellent condition.',
        primaryPrice: 15000,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(listingsService.create).toHaveBeenCalled();
  });

  it('GET /v1/listings is public', async () => {
    listingsService.search.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    });

    await request(app.getHttpServer()).get('/v1/listings').expect(200);
    expect(listingsService.search).toHaveBeenCalled();
  });

  it('PATCH /v1/listings/:id/status transitions status', async () => {
    listingsService.changeStatus.mockResolvedValue({
      id: 'L1',
      status: ListingStatus.PENDING,
    });

    const res = await request(app.getHttpServer())
      .patch('/v1/listings/L1/status')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: ListingStatus.PENDING })
      .expect(200);

    expect(res.body.data.status).toBe(ListingStatus.PENDING);
  });

  it('POST /v1/listings/:id/media adds media', async () => {
    listingsService.addMedia.mockResolvedValue({
      id: 'm1',
      mediaType: 'IMAGE',
      thumbnailKey: 'photos/a.thumb.jpg',
      sortOrder: 0,
    });

    const res = await request(app.getHttpServer())
      .post('/v1/listings/L1/media')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        mediaType: 'IMAGE',
        mediaAssetId: 'asset-1',
      })
      .expect(201);

    expect(res.body.data.thumbnailKey).toBe('photos/a.thumb.jpg');
  });

  it('DELETE /v1/listings/:id/media/:mediaId soft deletes media', async () => {
    listingsService.removeMedia.mockResolvedValue({ success: true });

    await request(app.getHttpServer())
      .delete('/v1/listings/L1/media/m1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(listingsService.removeMedia).toHaveBeenCalledWith('L1', 'm1', expect.any(Object));
  });
});
