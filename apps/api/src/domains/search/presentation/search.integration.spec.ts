import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { SearchController } from './search.controller';
import { SearchService } from '../application/search.service';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { PermissionsGuard } from '../../auth/presentation/guards/permissions.guard';
import { AppConfigService } from '../../../infrastructure/config/app-config.service';
import { UsersService } from '../../users/application/users.service';
import { permissionsForRole } from '../../auth/domain/permissions';
import { ResponseInterceptor } from '../../../shared/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../../../shared/filters/all-exceptions.filter';
import { SearchSort } from '../domain/search.types';

describe('Search HTTP integration', () => {
  let app: INestApplication;
  let accessToken: string;

  const searchService = {
    search: jest.fn(),
    suggestions: jest.fn(),
    trending: jest.fn(),
    recent: jest.fn(),
    saveSearch: jest.fn(),
    listSaved: jest.fn(),
    deleteSaved: jest.fn(),
  };

  const user = {
    id: 'user-1',
    firebaseUid: 'fb',
    phone: '+9647700000000',
    email: null,
    displayName: 'Searcher',
    role: 'USER' as const,
    status: 'ACTIVE',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        { provide: SearchService, useValue: searchService },
        JwtService,
        {
          provide: AppConfigService,
          useValue: {
            app: { jwt: { accessSecret: 'search-integration-secret', accessTtlSeconds: 900 } },
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
      { secret: 'search-integration-secret', expiresIn: 900 },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET /v1/search is public', async () => {
    searchService.search.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      sort: SearchSort.NEWEST,
    });

    await request(app.getHttpServer())
      .get('/v1/search')
      .query({ q: 'camry', sort: SearchSort.PRICE_LOW })
      .expect(200);

    expect(searchService.search).toHaveBeenCalled();
  });

  it('GET /v1/search/suggestions returns autocomplete', async () => {
    searchService.suggestions.mockResolvedValue([
      { type: 'BRAND', id: 'b1', label: 'Toyota' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/v1/search/suggestions')
      .query({ q: 'toy' })
      .expect(200);

    expect(res.body.data[0].type).toBe('BRAND');
  });

  it('GET /v1/search/trending is public', async () => {
    searchService.trending.mockResolvedValue({ brands: [], models: [], categories: [] });
    await request(app.getHttpServer()).get('/v1/search/trending').expect(200);
  });

  it('POST /v1/search/save requires auth', async () => {
    searchService.saveSearch.mockResolvedValue({ id: 's1' });

    await request(app.getHttpServer())
      .post('/v1/search/save')
      .send({ filters: { q: 'camry', brandId: 'b1' }, name: 'My Camry' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/v1/search/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ filters: { q: 'camry', brandId: 'b1' }, name: 'My Camry' })
      .expect(201);
  });

  it('GET/DELETE saved searches', async () => {
    searchService.listSaved.mockResolvedValue([{ id: 's1' }]);
    searchService.deleteSaved.mockResolvedValue({ success: true });

    await request(app.getHttpServer())
      .get('/v1/search/saved')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete('/v1/search/saved/s1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
