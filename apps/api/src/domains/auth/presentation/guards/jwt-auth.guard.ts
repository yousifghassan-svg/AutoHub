import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../../shared/decorators/public.decorator';
import type { AccessTokenPayload, AuthenticatedUser } from '../../domain/auth.types';
import { AppConfigService } from '../../../../infrastructure/config/app-config.service';
import { UsersService } from '../../../users/application/users.service';
import { mapAuthenticatedUser } from '../../application/map-authenticated-user';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly appConfig: AppConfigService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const token = extractBearer(request);

    if (isPublic) {
      if (token) {
        await this.attachUser(request, token, false);
      }
      return true;
    }

    if (!token) throw new UnauthorizedException('Missing access token');
    await this.attachUser(request, token, true);
    return true;
  }

  private async attachUser(
    request: Request & { user?: AuthenticatedUser },
    token: string,
    required: boolean,
  ): Promise<void> {
    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.appConfig.app.jwt.accessSecret,
      });
    } catch {
      if (required) throw new UnauthorizedException('Invalid or expired access token');
      return;
    }

    const user = await this.users.findActiveById(payload.sub);
    if (!user) {
      if (required) throw new UnauthorizedException('User not found or inactive');
      return;
    }

    request.user = mapAuthenticatedUser(user);
  }
}

function extractBearer(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (!header) return undefined;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;
  return token;
}
