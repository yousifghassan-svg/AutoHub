import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/auth.service';
import { FirebaseAuthService } from '../../../infrastructure/firebase/firebase-auth.service';
import { UsersService } from '../../users/application/users.service';
import { AppConfigService } from '../../../infrastructure/config/app-config.service';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository';
import { AuthAuditRepository } from '../infrastructure/auth-audit.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { APP_GUARD } from '@nestjs/core';
import { Permission } from '../domain/permissions';
import { ResponseInterceptor } from '../../../shared/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../../../shared/filters/all-exceptions.filter';
import { hashToken } from '../infrastructure/token.util';

describe('Auth HTTP integration', () => {
  let app: INestApplication;

  const firebase = { verifyPhoneIdToken: jest.fn() };
  const users = {
    findOrCreateFromFirebase: jest.fn(),
    findActiveById: jest.fn(),
  };
  const refreshStore = new Map<
    string,
    {
      id: string;
      userId: string;
      tokenHash: string;
      familyId: string;
      expiresAt: Date;
      revokedAt: Date | null;
    }
  >();

  const activeUser = {
    id: 'user-1',
    firebaseUid: 'fb-1',
    phone: '+9647700000000',
    email: null,
    displayName: 'Test User',
    role: 'USER' as const,
    status: 'ACTIVE',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: AppConfigService,
          useValue: {
            app: {
              jwt: {
                accessSecret: 'integration-test-secret',
                accessTtlSeconds: 900,
                refreshTtlSeconds: 3600,
              },
            },
          },
        },
        { provide: FirebaseAuthService, useValue: firebase },
        { provide: UsersService, useValue: users },
        {
          provide: RefreshTokenRepository,
          useValue: {
            create: jest.fn(async (data: {
              userId: string;
              tokenHash: string;
              familyId: string;
              expiresAt: Date;
            }) => {
              const row = {
                id: `rt-${refreshStore.size + 1}`,
                revokedAt: null,
                ...data,
              };
              refreshStore.set(data.tokenHash, row);
              return row;
            }),
            rotate: jest.fn(
              async (input: {
                revokeId: string;
                create: {
                  userId: string;
                  tokenHash: string;
                  familyId: string;
                  expiresAt: Date;
                };
              }) => {
                for (const [key, value] of refreshStore.entries()) {
                  if (value.id === input.revokeId) {
                    refreshStore.set(key, { ...value, revokedAt: new Date() });
                  }
                }
                const row = {
                  id: `rt-${refreshStore.size + 1}`,
                  revokedAt: null,
                  ...input.create,
                };
                refreshStore.set(input.create.tokenHash, row);
                return row;
              },
            ),
            findByHash: jest.fn(async (tokenHash: string) => refreshStore.get(tokenHash) ?? null),
            revoke: jest.fn(async (id: string) => {
              for (const [key, value] of refreshStore.entries()) {
                if (value.id === id) {
                  refreshStore.set(key, { ...value, revokedAt: new Date() });
                }
              }
            }),
            revokeFamily: jest.fn(),
            revokeAllForUser: jest.fn(async (userId: string) => {
              for (const [key, value] of refreshStore.entries()) {
                if (value.userId === userId) {
                  refreshStore.set(key, { ...value, revokedAt: new Date() });
                }
              }
            }),
          },
        },
        {
          provide: AuthAuditRepository,
          useValue: { create: jest.fn().mockResolvedValue({}) },
        },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    refreshStore.clear();
    users.findActiveById.mockImplementation(async (id: string) =>
      id === activeUser.id ? activeUser : null,
    );
  });

  it('POST /v1/auth/login issues tokens', async () => {
    firebase.verifyPhoneIdToken.mockResolvedValue({
      firebaseUid: 'fb-1',
      phone: '+9647700000000',
      displayName: 'Test User',
    });
    users.findOrCreateFromFirebase.mockResolvedValue({ user: activeUser, created: true });

    const res = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ idToken: 'firebase-token' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
    expect(res.body.data.user.role).toBe('USER');
    expect(res.body.data.user.permissions).toContain(Permission.PROFILE_READ);
  });

  it('GET /v1/auth/me requires auth and returns profile', async () => {
    firebase.verifyPhoneIdToken.mockResolvedValue({
      firebaseUid: 'fb-1',
      phone: '+9647700000000',
    });
    users.findOrCreateFromFirebase.mockResolvedValue({ user: activeUser, created: false });

    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ idToken: 'firebase-token' })
      .expect(201);

    const accessToken = login.body.data.accessToken as string;

    const me = await request(app.getHttpServer())
      .get('/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(me.body.data.id).toBe('user-1');
    expect(me.body.data.phone).toBe('+9647700000000');
  });

  it('POST /v1/auth/refresh rotates refresh token', async () => {
    firebase.verifyPhoneIdToken.mockResolvedValue({
      firebaseUid: 'fb-1',
      phone: '+9647700000000',
    });
    users.findOrCreateFromFirebase.mockResolvedValue({ user: activeUser, created: false });

    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ idToken: 'firebase-token' })
      .expect(201);

    const refreshToken = login.body.data.refreshToken as string;

    const refreshed = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    expect(refreshed.body.data.accessToken).toBeTruthy();
    expect(refreshed.body.data.refreshToken).not.toBe(refreshToken);
    expect(refreshStore.get(hashToken(refreshToken))?.revokedAt).toBeTruthy();
  });

  it('POST /v1/auth/logout revokes session', async () => {
    firebase.verifyPhoneIdToken.mockResolvedValue({
      firebaseUid: 'fb-1',
      phone: '+9647700000000',
    });
    users.findOrCreateFromFirebase.mockResolvedValue({ user: activeUser, created: false });

    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ idToken: 'firebase-token' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ refreshToken: login.body.data.refreshToken })
      .expect(201);

    await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refreshToken: login.body.data.refreshToken })
      .expect(401);
  });
});
