import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository';
import { AuthAuditRepository } from './infrastructure/auth-audit.repository';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/guards/roles.guard';
import { PermissionsGuard } from './presentation/guards/permissions.guard';

/**
 * Auth domain — Firebase phone login, JWT access/refresh, RBAC guards.
 */
@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenRepository,
    AuthAuditRepository,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, PermissionsGuard, JwtModule, UsersModule],
})
export class AuthModule {}
