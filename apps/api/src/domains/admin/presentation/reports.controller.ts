import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { AdminReportsService } from '../application/admin-reports.service';
import { CreateListingReportDto } from './dto/admin-reports.dto';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: AdminReportsService) {}

  @Post()
  @Permissions(Permission.REPORTS_WRITE)
  @ApiOperation({ summary: 'Report a listing (authenticated users)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateListingReportDto,
  ): Promise<unknown> {
    return this.reports.create(body, user);
  }
}
