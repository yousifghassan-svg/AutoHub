import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import { AdminDashboardService } from '../application/admin-dashboard.service';

@ApiTags('admin-dashboard')
@ApiBearerAuth('access-token')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.STATS_READ)
  @ApiOperation({ summary: 'Admin marketplace dashboard summary' })
  @ApiOkResponse({
    description: 'Aggregated marketplace KPIs',
  })
  getDashboard(): Promise<unknown> {
    return this.dashboard.getSummary();
  }
}
