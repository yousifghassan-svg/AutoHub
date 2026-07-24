import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import { AdminAuditQueryService } from '../application/admin-audit-query.service';
import { AdminAuditQueryDto } from './dto/admin-audit.dto';

@ApiTags('admin-audit')
@ApiBearerAuth('access-token')
@Controller('admin/audit-logs')
export class AdminAuditController {
  constructor(private readonly audit: AdminAuditQueryService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.STATS_READ)
  @ApiOperation({ summary: 'List admin audit logs' })
  list(@Query() query: AdminAuditQueryDto): Promise<unknown> {
    return this.audit.list(query);
  }
}
