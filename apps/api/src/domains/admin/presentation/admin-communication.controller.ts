import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { AdminCommunicationService } from '../application/admin-communication.service';
import {
  AdminBlocksQueryDto,
  AdminCommunicationReportsQueryDto,
  ModerateConversationDto,
  ResolveConversationReportDto,
} from './dto/admin-communication.dto';

@ApiTags('admin-communication')
@ApiBearerAuth('access-token')
@Controller('admin/communication')
export class AdminCommunicationController {
  constructor(private readonly communication: AdminCommunicationService) {}

  @Get('stats')
  @Permissions(Permission.ADMIN_ACCESS, Permission.MESSAGES_MODERATE)
  @ApiOperation({ summary: 'Communication platform stats' })
  stats() {
    return this.communication.stats();
  }

  @Get('reports')
  @Permissions(Permission.ADMIN_ACCESS, Permission.MESSAGES_MODERATE)
  @ApiOperation({ summary: 'Reported conversations' })
  reports(@Query() query: AdminCommunicationReportsQueryDto) {
    return this.communication.listReportedConversations(query);
  }

  @Patch('reports/:id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.MESSAGES_MODERATE)
  @ApiOperation({ summary: 'Resolve or reject conversation report' })
  resolveReport(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ResolveConversationReportDto,
  ) {
    return this.communication.resolveReport(id, user, body);
  }

  @Get('blocks')
  @Permissions(Permission.ADMIN_ACCESS, Permission.MESSAGES_MODERATE)
  @ApiOperation({ summary: 'List user blocks' })
  blocks(@Query() query: AdminBlocksQueryDto) {
    return this.communication.listBlocks(query);
  }

  @Post('moderate')
  @Permissions(Permission.ADMIN_ACCESS, Permission.MESSAGES_MODERATE)
  @ApiOperation({ summary: 'Hide conversation or remove message' })
  moderate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ModerateConversationDto,
  ) {
    return this.communication.moderate(user, body);
  }
}
