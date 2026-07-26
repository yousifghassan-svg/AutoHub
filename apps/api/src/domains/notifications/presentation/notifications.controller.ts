import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { NotificationsService } from '../application/notifications.service';
import {
  MarkNotificationReadDto,
  NotificationsQueryDto,
  RegisterDeviceDto,
  UnregisterDeviceDto,
} from './dto/notifications.dto';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @Permissions(Permission.PROFILE_READ)
  @ApiOperation({ summary: 'List in-app notifications' })
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: NotificationsQueryDto) {
    return this.notifications.list(user.id, query);
  }

  @Patch(':id')
  @Permissions(Permission.PROFILE_READ)
  @ApiOperation({ summary: 'Mark notification as read' })
  markOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notifications.markRead(user.id, id);
  }

  @Patch()
  @Permissions(Permission.PROFILE_READ)
  @ApiOperation({ summary: 'Mark all notifications read' })
  markAll(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: MarkNotificationReadDto,
  ) {
    if (body.all) return this.notifications.markAllRead(user.id);
    return this.notifications.markAllRead(user.id);
  }

  @Post('devices')
  @Permissions(Permission.PROFILE_WRITE)
  @ApiOperation({ summary: 'Register push device token' })
  registerDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RegisterDeviceDto,
  ) {
    return this.notifications.registerDeviceToken(
      user.id,
      body.token,
      body.platform,
    );
  }

  @Post('devices/unregister')
  @Permissions(Permission.PROFILE_WRITE)
  @ApiOperation({ summary: 'Unregister push device token' })
  unregisterDevice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UnregisterDeviceDto,
  ) {
    return this.notifications.unregisterDeviceToken(user.id, body.token);
  }
}
