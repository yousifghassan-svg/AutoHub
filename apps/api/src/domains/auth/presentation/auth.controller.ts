import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { AuthService } from '../application/auth.service';
import { Permission } from '../domain/permissions';
import type { AuthenticatedUser } from '../domain/auth.types';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { AuthTokensDto, AuthenticatedUserDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login with Firebase phone ID token',
    description:
      'Verifies Firebase phone authentication, creates a user profile on first login, and issues JWT access + refresh tokens.',
  })
  @ApiOkResponse({ type: AuthTokensDto })
  login(@Body() body: LoginDto, @Req() req: Request) {
    return this.auth.login(body.idToken, requestContext(req));
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({ type: AuthTokensDto })
  refresh(@Body() body: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(body.refreshToken, requestContext(req));
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.PROFILE_READ)
  @ApiOperation({ summary: 'Logout and revoke refresh token(s)' })
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: LogoutDto,
    @Req() req: Request,
  ) {
    return this.auth.logout(
      user.id,
      body.refreshToken,
      requestContext(req),
      body.revokeAll ?? false,
    );
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.PROFILE_READ)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({ type: AuthenticatedUserDto })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.me(user);
  }
}

function requestContext(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}
