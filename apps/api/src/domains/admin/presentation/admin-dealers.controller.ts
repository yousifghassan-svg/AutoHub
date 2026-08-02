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
import { AdminDealersService } from '../application/admin-dealers.service';
import { adminRequestContext } from './admin-request.util';
import {
  AdminCreateDealerDto,
  AdminDealersQueryDto,
  AdminRejectDealerDto,
  AdminUpdateDealerDto,
} from './dto/admin-dealers.dto';

@ApiTags('admin-dealers')
@ApiBearerAuth('access-token')
@Controller('admin/dealers')
export class AdminDealersController {
  constructor(private readonly dealers: AdminDealersService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.DEALERS_MANAGE)
  @ApiOperation({ summary: 'List dealers (filter with status=PENDING for queue)' })
  list(@Query() query: AdminDealersQueryDto): Promise<unknown> {
    return this.dealers.list(query);
  }

  @Post()
  @Permissions(Permission.ADMIN_ACCESS, Permission.DEALERS_MANAGE)
  @ApiOperation({ summary: 'Create dealer organization (ops/emergency)' })
  create(
    @Body() body: AdminCreateDealerDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.dealers.create(body, user, adminRequestContext(req));
  }

  @Post(':id/approve')
  @Permissions(Permission.ADMIN_ACCESS, Permission.DEALERS_VERIFY)
  @ApiOperation({ summary: 'Approve pending dealer application' })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.dealers.approve(id, user, adminRequestContext(req));
  }

  @Post(':id/reject')
  @Permissions(Permission.ADMIN_ACCESS, Permission.DEALERS_VERIFY)
  @ApiOperation({ summary: 'Reject pending dealer application' })
  reject(
    @Param('id') id: string,
    @Body() body: AdminRejectDealerDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.dealers.reject(id, user, body.reason, adminRequestContext(req));
  }

  @Get(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.DEALERS_MANAGE)
  @ApiOperation({ summary: 'Get dealer with statistics' })
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.dealers.findById(id);
  }

  @Patch(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.DEALERS_MANAGE)
  @ApiOperation({ summary: 'Update dealer organization' })
  update(
    @Param('id') id: string,
    @Body() body: AdminUpdateDealerDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.dealers.update(id, body, user, adminRequestContext(req));
  }

  @Delete(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.DEALERS_MANAGE)
  @ApiOperation({ summary: 'Soft-delete dealer organization' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.dealers.remove(id, user, adminRequestContext(req));
  }
}
