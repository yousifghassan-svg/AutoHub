import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { MediaService } from '../application/media.service';
import { AdminListMediaDto } from './dto/list-media.dto';

@ApiTags('admin-media')
@ApiBearerAuth('access-token')
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.MEDIA_READ)
  @ApiOperation({
    summary: 'Admin media library',
    description:
      'Paginated media assets with filters (type/status/unused/duplicates) and storage usage aggregate.',
  })
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: AdminListMediaDto) {
    return this.media.listAdmin(user, {
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      mediaType: query.mediaType,
      status: query.status,
      unused: query.unused,
      duplicates: query.duplicates,
      includeDeleted: query.includeDeleted,
    });
  }

  @Post(':id/restore')
  @Permissions(Permission.ADMIN_ACCESS, Permission.MEDIA_DELETE)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Restore soft-deleted media (within 72h retention)',
  })
  restore(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.media.restore(id, user);
  }

  @Delete(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.MEDIA_DELETE)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Soft-delete media asset (R2 reaped after 72h)',
  })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.media.delete(id, user);
  }
}
