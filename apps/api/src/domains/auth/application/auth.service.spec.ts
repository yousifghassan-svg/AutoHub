import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthAuditAction } from '@autohub/database';
import { AuthService } from './auth.service';
import { Permission } from '../domain/permissions';

describe('AuthService', () => {
  const firebase = {
    verifyPhoneIdToken: jest.fn(),
  };
  const users = {
    findOrCreateFromFirebase: jest.fn(),
    findActiveById: jest.fn(),
    findActiveByPhone: jest.fn(),
  };
  const jwt = {
    signAsync: jest.fn().mockResolvedValue('access.jwt'),
  };
  const appConfig = {
    app: {
      jwt: {
        accessSecret: 'test-secret-value-16',
        accessTtlSeconds: 900,
        refreshTtlSeconds: 3600,
      },
      allowStaffLogin: true,
      allowDevLogin: true,
    },
  };
  const refreshTokens = {
    create: jest.fn(),
    findByHash: jest.fn(),
    revoke: jest.fn(),
    rotate: jest.fn().mockResolvedValue({ id: 'rt-2' }),
    revokeFamily: jest.fn(),
    revokeAllForUser: jest.fn(),
  };
  const audit = {
    create: jest.fn(),
  };

  const service = new AuthService(
    firebase as never,
    users as never,
    jwt as unknown as JwtService,
    appConfig as never,
    refreshTokens as never,
    audit as never,
  );

  const activeUser = {
    id: 'user-1',
    firebaseUid: 'fb-1',
    phone: '+9647700000000',
    email: null,
    displayName: null,
    role: 'USER' as const,
    status: 'ACTIVE',
  };

  const staffUser = {
    ...activeUser,
    id: 'admin-1',
    role: 'ADMIN' as const,
    phone: '+9647700090001',
    firebaseUid: 'fb-admin-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    appConfig.app.allowStaffLogin = true;
    appConfig.app.allowDevLogin = true;
  });

  it('logs in, creates tokens, and audits LOGIN', async () => {
    firebase.verifyPhoneIdToken.mockResolvedValue({
      firebaseUid: 'fb-1',
      phone: '+9647700000000',
    });
    users.findOrCreateFromFirebase.mockResolvedValue({ user: activeUser, created: true });
    refreshTokens.create.mockResolvedValue({});

    const result = await service.login('firebase-id-token', { ipAddress: '127.0.0.1' });

    expect(result.accessToken).toBe('access.jwt');
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.permissions).toContain(Permission.PROFILE_READ);
    expect(audit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: AuthAuditAction.LOGIN,
        metadata: expect.objectContaining({ created: true }),
      }),
    );
  });

  it('rejects inactive users on login', async () => {
    firebase.verifyPhoneIdToken.mockResolvedValue({
      firebaseUid: 'fb-1',
      phone: '+9647700000000',
    });
    users.findOrCreateFromFirebase.mockResolvedValue({
      user: { ...activeUser, status: 'SUSPENDED' },
      created: false,
    });

    await expect(service.login('token', {})).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refreshes tokens and audits TOKEN_REFRESH', async () => {
    refreshTokens.findByHash.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      familyId: 'fam-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    users.findActiveById.mockResolvedValue(activeUser);

    const result = await service.refresh('refresh-token-value', {});

    expect(result.accessToken).toBe('access.jwt');
    expect(refreshTokens.rotate).toHaveBeenCalledWith(
      expect.objectContaining({ revokeId: 'rt-1' }),
    );
    expect(refreshTokens.revoke).not.toHaveBeenCalled();
    expect(audit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuthAuditAction.TOKEN_REFRESH,
        userId: 'user-1',
      }),
    );
  });

  it('detects refresh token reuse', async () => {
    refreshTokens.findByHash.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      familyId: 'fam-1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.refresh('old-token', {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(refreshTokens.revokeFamily).toHaveBeenCalledWith('fam-1');
  });

  it('logs out and audits LOGOUT', async () => {
    refreshTokens.findByHash.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      revokedAt: null,
    });

    await service.logout('user-1', 'refresh-token-value', {});

    expect(refreshTokens.revoke).toHaveBeenCalledWith('rt-1');
    expect(audit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuthAuditAction.LOGOUT,
        userId: 'user-1',
      }),
    );
  });

  it('rejects staffLogin when allowStaffLogin is false', async () => {
    appConfig.app.allowStaffLogin = false;
    await expect(service.staffLogin('+9647700090001', {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(users.findActiveByPhone).not.toHaveBeenCalled();
  });

  it('rejects staffLogin for non-staff roles', async () => {
    users.findActiveByPhone.mockResolvedValue(activeUser);
    await expect(service.staffLogin(activeUser.phone, {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('issues tokens for staffLogin when enabled', async () => {
    users.findActiveByPhone.mockResolvedValue(staffUser);
    refreshTokens.create.mockResolvedValue({});

    const result = await service.staffLogin(staffUser.phone, {});

    expect(result.accessToken).toBe('access.jwt');
    expect(result.user.role).toBe('ADMIN');
    expect(audit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ provider: 'staff_phone' }),
      }),
    );
  });

  it('rejects devLogin when allowDevLogin is false', async () => {
    appConfig.app.allowDevLogin = false;
    await expect(service.devLogin('+9647700010006', {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(users.findActiveByPhone).not.toHaveBeenCalled();
  });

  it('issues tokens for devLogin when enabled', async () => {
    users.findActiveByPhone.mockResolvedValue(null);
    users.findOrCreateFromFirebase.mockResolvedValue({
      user: { ...activeUser, firebaseUid: 'dev:+9647700010006', phone: '+9647700010006' },
      created: true,
    });
    refreshTokens.create.mockResolvedValue({});

    const result = await service.devLogin('+9647700010006', {});

    expect(result.accessToken).toBe('access.jwt');
    expect(audit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ provider: 'dev_phone', created: true }),
      }),
    );
  });
});
