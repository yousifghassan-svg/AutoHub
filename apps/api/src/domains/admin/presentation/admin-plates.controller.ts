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
import { AdminPlatesService } from '../application/admin-plates.service';
import { adminRequestContext } from './admin-request.util';
import {
  AdminCreatePlateDto,
  AdminPlatesQueryDto,
  AdminUpdatePlateDto,
} from './dto/admin-plates.dto';

@ApiTags('admin-plates')
@ApiBearerAuth('access-token')
@Controller('admin/plates')
export class AdminPlatesController {
  constructor(private readonly plates: AdminPlatesService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_READ)
  @ApiOperation({ summary: 'List/search plate listings (admin)' })
  list(@Query() query: AdminPlatesQueryDto): Promise<unknown> {
    return this.plates.list(query);
  }

  @Get(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_READ)
  @ApiOperation({ summary: 'Get plate listing by id' })
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.plates.findById(id);
  }

  @Post()
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Create plate listing (admin)' })
  create(
    @Body() body: AdminCreatePlateDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.plates.create(body, user, adminRequestContext(req));
  }

  @Patch(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Update plate listing (admin)' })
  update(
    @Param('id') id: string,
    @Body() body: AdminUpdatePlateDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.plates.update(id, body, user, adminRequestContext(req));
  }

  @Delete(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Delete plate listing (admin)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.plates.remove(id, user, adminRequestContext(req));
  }
}
