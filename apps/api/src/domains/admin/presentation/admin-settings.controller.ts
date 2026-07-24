import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { AdminSettingsService } from '../application/admin-settings.service';
import { adminRequestContext } from './admin-request.util';
import { AdminUpdateSettingsDto } from './dto/admin-settings.dto';

@ApiTags('admin-settings')
@ApiBearerAuth('access-token')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: AdminSettingsService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.SETTINGS_READ)
  @ApiOperation({ summary: 'Get site settings' })
  get(): Promise<unknown> {
    return this.settings.get();
  }

  @Patch()
  @Permissions(Permission.ADMIN_ACCESS, Permission.SETTINGS_WRITE)
  @ApiOperation({ summary: 'Update site settings' })
  update(
    @Body() body: AdminUpdateSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.settings.update(body, user, adminRequestContext(req));
  }
}
