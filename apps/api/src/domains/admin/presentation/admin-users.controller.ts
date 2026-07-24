import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { AdminUsersService } from '../application/admin-users.service';
import { adminRequestContext } from './admin-request.util';
import { AdminUpdateUserDto, AdminUsersQueryDto } from './dto/admin-users.dto';

@ApiTags('admin-users')
@ApiBearerAuth('access-token')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.USERS_READ)
  @ApiOperation({ summary: 'List users' })
  list(@Query() query: AdminUsersQueryDto): Promise<unknown> {
    return this.users.list(query);
  }

  @Get(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USERS_READ)
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.users.findById(id);
  }

  @Patch(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id') id: string,
    @Body() body: AdminUpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.users.update(id, body, user, adminRequestContext(req));
  }

  @Delete(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Soft-delete user' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.users.softDelete(id, user, adminRequestContext(req));
  }

  @Post(':id/suspend')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Suspend user' })
  suspend(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.users.suspend(id, user, adminRequestContext(req));
  }

  @Post(':id/activate')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Activate user' })
  activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.users.activate(id, user, adminRequestContext(req));
  }

  @Post(':id/verify-dealer')
  @Permissions(Permission.ADMIN_ACCESS, Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Verify user as dealer + mark org verified' })
  verifyDealer(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.users.verifyDealer(id, user, adminRequestContext(req));
  }
}
