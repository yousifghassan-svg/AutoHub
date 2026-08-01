import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthAuditAction } from '@autohub/database';
import { AppConfigService } from '../../../infrastructure/config/app-config.service';
import { FirebaseAuthService } from '../../../infrastructure/firebase/firebase-auth.service';
import { UsersService } from '../../users/application/users.service';
import { AuthAuditRepository } from '../infrastructure/auth-audit.repository';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository';
import { generateOpaqueToken, hashToken } from '../infrastructure/token.util';
import { isStaffRole, permissionsForRole } from '../domain/permissions';
import type {
  AccessTokenPayload,
  AuthenticatedUser,
  RequestContext,
} from '../domain/auth.types';

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly firebase: FirebaseAuthService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly appConfig: AppConfigService,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly audit: AuthAuditRepository,
  ) {}

  async login(idToken: string, ctx: RequestContext): Promise<AuthTokensResponse> {
    const identity = await this.firebase.verifyPhoneIdToken(idToken);
    const { user, created } = await this.users.findOrCreateFromFirebase(identity);

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('User account is not active');
    }

    const tokens = await this.issueTokens(user.id, user.role, {
      firebaseUid: user.firebaseUid,
      phone: user.phone,
    }, ctx);

    await this.audit.create({
      userId: user.id,
      action: AuthAuditAction.LOGIN,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { created, provider: 'firebase_phone' },
    });

    return {
      ...tokens,
      user: this.toAuthenticatedUser(user),
    };
  }

  /**
   * Staff dashboard login by phone (seed admins / local ops).
   * Development/staging only — always disabled when NODE_ENV=production.
   */
  async staffLogin(phone: string, ctx: RequestContext): Promise<AuthTokensResponse> {
    if (!this.appConfig.app.allowStaffLogin) {
      throw new ForbiddenException('Staff phone login is disabled');
    }

    const normalized = normalizePhone(phone);
    const user = await this.users.findActiveByPhone(normalized);
    if (!user) {
      throw new UnauthorizedException('Staff account not found');
    }
    if (!isStaffRole(user.role)) {
      throw new ForbiddenException('Account is not an admin staff role');
    }

    const tokens = await this.issueTokens(
      user.id,
      user.role,
      { firebaseUid: user.firebaseUid, phone: user.phone },
      ctx,
    );

    await this.audit.create({
      userId: user.id,
      action: AuthAuditAction.LOGIN,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { provider: 'staff_phone' },
    });

    return {
      ...tokens,
      user: this.toAuthenticatedUser(user),
    };
  }

  /**
   * Non-production phone login for Web/mobile without Firebase.
   * Development/staging only — always disabled when NODE_ENV=production.
   * Reuses seed users by phone, or creates a USER.
   */
  async devLogin(phone: string, ctx: RequestContext): Promise<AuthTokensResponse> {
    if (!this.appConfig.app.allowDevLogin) {
      throw new ForbiddenException('Dev phone login is disabled');
    }

    const normalized = normalizePhone(phone);
    const existing = await this.users.findActiveByPhone(normalized);
    let user = existing;
    let created = false;

    if (!user) {
      const createdUser = await this.users.findOrCreateFromFirebase({
        firebaseUid: `dev:${normalized}`,
        phone: normalized,
        email: null,
        displayName: null,
      });
      user = createdUser.user;
      created = createdUser.created;
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('User account is not active');
    }

    const tokens = await this.issueTokens(
      user.id,
      user.role,
      { firebaseUid: user.firebaseUid, phone: user.phone },
      ctx,
    );

    await this.audit.create({
      userId: user.id,
      action: AuthAuditAction.LOGIN,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { created, provider: 'dev_phone' },
    });

    return {
      ...tokens,
      user: this.toAuthenticatedUser(user),
    };
  }

  async refresh(refreshToken: string, ctx: RequestContext): Promise<AuthTokensResponse> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      await this.refreshTokens.revokeFamily(stored.familyId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokens.revoke(stored.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.users.findActiveById(stored.userId);
    if (!user) {
      await this.refreshTokens.revokeFamily(stored.familyId);
      throw new UnauthorizedException('User not found or inactive');
    }

    const next = await this.issueTokens(
      user.id,
      user.role,
      { firebaseUid: user.firebaseUid, phone: user.phone },
      ctx,
      stored.familyId,
      stored.id,
    );

    await this.audit.create({
      userId: user.id,
      action: AuthAuditAction.TOKEN_REFRESH,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { familyId: stored.familyId },
    });

    return {
      ...next,
      user: this.toAuthenticatedUser(user),
    };
  }

  async logout(
    userId: string,
    refreshToken: string | undefined,
    ctx: RequestContext,
    revokeAll = false,
  ): Promise<{ success: true }> {
    if (revokeAll) {
      await this.refreshTokens.revokeAllForUser(userId);
    } else if (refreshToken) {
      const stored = await this.refreshTokens.findByHash(hashToken(refreshToken));
      if (stored && stored.userId === userId && !stored.revokedAt) {
        await this.refreshTokens.revoke(stored.id);
      }
    } else {
      await this.refreshTokens.revokeAllForUser(userId);
    }

    await this.audit.create({
      userId,
      action: AuthAuditAction.LOGOUT,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { revokeAll: revokeAll || !refreshToken },
    });

    return { success: true };
  }

  async me(user: AuthenticatedUser): Promise<AuthenticatedUser> {
    const fresh = await this.users.findActiveById(user.id);
    if (!fresh) throw new UnauthorizedException('User not found or inactive');
    return this.toAuthenticatedUser(fresh);
  }

  private async issueTokens(
    userId: string,
    role: AuthenticatedUser['role'],
    identity: { firebaseUid: string | null; phone: string | null },
    ctx: RequestContext,
    familyId: string = randomUUID(),
    /** When set, create+revoke happen in one transaction (refresh rotation). */
    revokePreviousId?: string,
  ): Promise<Omit<AuthTokensResponse, 'user'>> {
    const permissions = permissionsForRole(role);
    const { accessSecret, accessTtlSeconds, refreshTtlSeconds } = this.appConfig.app.jwt;

    const payload: AccessTokenPayload = {
      sub: userId,
      role,
      permissions,
      firebaseUid: identity.firebaseUid,
      phone: identity.phone,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessTtlSeconds,
    });

    const refreshToken = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + refreshTtlSeconds * 1000);
    const createPayload = {
      userId,
      tokenHash: hashToken(refreshToken),
      familyId,
      expiresAt,
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
    };

    if (revokePreviousId) {
      await this.refreshTokens.rotate({
        revokeId: revokePreviousId,
        create: createPayload,
      });
    } else {
      await this.refreshTokens.create(createPayload);
    }

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTtlSeconds,
    };
  }

  private toAuthenticatedUser(user: {
    id: string;
    firebaseUid: string | null;
    phone: string | null;
    email: string | null;
    displayName: string | null;
    role: AuthenticatedUser['role'];
    status: string;
  }): AuthenticatedUser {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      phone: user.phone,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      permissions: permissionsForRole(user.role),
      status: user.status,
    };
  }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('964')) return `+${digits}`;
  if (digits.startsWith('0')) return `+964${digits.slice(1)}`;
  return `+964${digits}`;
}
