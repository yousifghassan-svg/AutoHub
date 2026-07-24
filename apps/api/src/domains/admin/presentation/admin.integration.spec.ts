import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { ListingStatus, ReportReason, UserRole } from '@autohub/database';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { PermissionsGuard } from '../../auth/presentation/guards/permissions.guard';
import { AppConfigService } from '../../../infrastructure/config/app-config.service';
import { UsersService } from '../../users/application/users.service';
import { permissionsForRole } from '../../auth/domain/permissions';
import { ResponseInterceptor } from '../../../shared/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../../../shared/filters/all-exceptions.filter';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminListingsController } from './admin-listings.controller';
import { AdminReportsController } from './admin-reports.controller';
import { ReportsController } from './reports.controller';
import { AdminDashboardService } from '../application/admin-dashboard.service';
import { AdminListingsService } from '../application/admin-listings.service';
import { AdminReportsService } from '../application/admin-reports.service';

describe('Admin HTTP integration', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  const dashboard = { getSummary: jest.fn() };
  const listings = {
    list: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    archive: jest.fn(),
    feature: jest.fn(),
    unfeature: jest.fn(),
  };
  const reports = {
    create: jest.fn(),
    list: jest.fn(),
    resolve: jest.fn(),
    reject: jest.fn(),
    banListing: jest.fn(),
  };

  const adminUser = {
    id: 'admin-1',
    firebaseUid: 'fb-admin',
    phone: '+9647700090002',
    email: 'admin@seed.autohub.iq',
    displayName: 'Admin',
    role: UserRole.ADMIN,
    status: 'ACTIVE',
  };

  const normalUser = {
    id: 'user-1',
    firebaseUid: 'fb-user',
    phone: '+9647700000000',
    email: null,
    displayName: 'User',
    role: UserRole.USER,
    status: 'ACTIVE',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        AdminDashboardController,
        AdminListingsController,
        AdminReportsController,
        ReportsController,
      ],
      providers: [
        { provide: AdminDashboardService, useValue: dashboard },
        { provide: AdminListingsService, useValue: listings },
        { provide: AdminReportsService, useValue: reports },
        JwtService,
        {
          provide: AppConfigService,
          useValue: {
            app: { jwt: { accessSecret: 'admin-integration-secret', accessTtlSeconds: 900 } },
          },
        },
        {
          provide: UsersService,
          useValue: {
            findActiveById: jest.fn(async (id: string) => {
              if (id === adminUser.id) return adminUser;
              if (id === normalUser.id) return normalUser;
              return null;
            }),
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
    adminToken = await jwt.signAsync(
      {
        sub: adminUser.id,
        role: adminUser.role,
        permissions: permissionsForRole(adminUser.role),
      },
      { secret: 'admin-integration-secret', expiresIn: 900 },
    );
    userToken = await jwt.signAsync(
      {
        sub: normalUser.id,
        role: normalUser.role,
        permissions: permissionsForRole(normalUser.role),
      },
      { secret: 'admin-integration-secret', expiresIn: 900 },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET /v1/admin/dashboard returns summary for admin', async () => {
    dashboard.getSummary.mockResolvedValue({
      totalUsers: 10,
      totalDealers: 5,
      totalCars: 100,
      totalPlates: 200,
      activeListings: 250,
      soldListings: 20,
      pendingListings: 5,
      archivedListings: 10,
      todaysListings: 3,
      thisMonthListings: 40,
      totalViews: 1000,
      totalFavorites: 80,
    });

    const res = await request(app.getHttpServer())
      .get('/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCars).toBe(100);
  });

  it('GET /v1/admin/dashboard rejects regular users', async () => {
    await request(app.getHttpServer())
      .get('/v1/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('POST /v1/admin/listings/:id/approve moderates listing', async () => {
    listings.approve.mockResolvedValue({ id: 'L1', status: ListingStatus.ACTIVE });

    const res = await request(app.getHttpServer())
      .post('/v1/admin/listings/L1/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    expect(res.body.data.status).toBe(ListingStatus.ACTIVE);
    expect(listings.approve).toHaveBeenCalled();
  });

  it('POST /v1/reports creates a listing report for users', async () => {
    reports.create.mockResolvedValue({
      id: 'r1',
      listingId: 'L1',
      reason: ReportReason.SPAM,
      status: 'OPEN',
    });

    const res = await request(app.getHttpServer())
      .post('/v1/reports')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ listingId: 'L1', reason: ReportReason.SPAM, details: 'Looks fake' })
      .expect(201);

    expect(res.body.data.id).toBe('r1');
    expect(reports.create).toHaveBeenCalled();
  });

  it('POST /v1/admin/reports/:id/ban-listing bans listing', async () => {
    reports.banListing.mockResolvedValue({ id: 'r1', status: 'RESOLVED' });

    const res = await request(app.getHttpServer())
      .post('/v1/admin/reports/r1/ban-listing')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    expect(res.body.data.status).toBe('RESOLVED');
  });
});
