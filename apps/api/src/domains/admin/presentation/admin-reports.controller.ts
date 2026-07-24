import {
  Body,
  Controller,
  Get,
  Param,
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
import { AdminReportsService } from '../application/admin-reports.service';
import { adminRequestContext } from './admin-request.util';
import {
  AdminReportsQueryDto,
  ResolveReportDto,
} from './dto/admin-reports.dto';

@ApiTags('admin-reports')
@ApiBearerAuth('access-token')
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly reports: AdminReportsService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.REPORTS_READ)
  @ApiOperation({ summary: 'List listing reports' })
  list(@Query() query: AdminReportsQueryDto): Promise<unknown> {
    return this.reports.list(query);
  }

  @Post(':id/resolve')
  @Permissions(Permission.ADMIN_ACCESS, Permission.REPORTS_WRITE)
  @ApiOperation({ summary: 'Resolve report' })
  resolve(
    @Param('id') id: string,
    @Body() body: ResolveReportDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.reports.resolve(id, body.resolution, user, adminRequestContext(req));
  }

  @Post(':id/reject')
  @Permissions(Permission.ADMIN_ACCESS, Permission.REPORTS_WRITE)
  @ApiOperation({ summary: 'Reject report' })
  reject(
    @Param('id') id: string,
    @Body() body: ResolveReportDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.reports.reject(id, body.resolution, user, adminRequestContext(req));
  }

  @Post(':id/ban-listing')
  @Permissions(Permission.ADMIN_ACCESS, Permission.REPORTS_WRITE)
  @ApiOperation({ summary: 'Ban reported listing (archive + resolve)' })
  banListing(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.reports.banListing(id, user, adminRequestContext(req));
  }
}
