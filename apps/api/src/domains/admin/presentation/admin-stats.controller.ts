import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import { AdminStatsService } from '../application/admin-stats.service';
import { AdminStatsQueryDto } from './dto/admin-stats.dto';

@ApiTags('admin-stats')
@ApiBearerAuth('access-token')
@Controller('admin/stats')
export class AdminStatsController {
  constructor(private readonly stats: AdminStatsService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.STATS_READ)
  @ApiOperation({
    summary: 'Platform statistics',
    description:
      'Daily / weekly / monthly overview with top brands, cities, searches, and dealers.',
  })
  overview(@Query() query: AdminStatsQueryDto): Promise<unknown> {
    return this.stats.overview(query.range ?? 'monthly');
  }
}
