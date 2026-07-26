import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { ConversationsService } from '../application/conversations.service';

@ApiTags('dealers')
@ApiBearerAuth('access-token')
@Controller('dealers')
export class DealersFollowController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get(':id/follow')
  @Permissions(Permission.MESSAGES_READ)
  @ApiOperation({ summary: 'Dealer follow status for current user' })
  followStatus(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversations.getFollowStatus(user, id);
  }

  @Post(':id/follow')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Follow a dealer organization' })
  follow(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversations.followDealer(user, id);
  }

  @Delete(':id/follow')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Unfollow a dealer organization' })
  unfollow(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversations.unfollowDealer(user, id);
  }
}
