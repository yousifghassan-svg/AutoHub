import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { ConversationsService } from '../application/conversations.service';
import { BlockUserDto } from './dto/communication.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersBlocksController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get('me/blocks')
  @Permissions(Permission.MESSAGES_READ)
  @ApiOperation({ summary: 'List users blocked by me' })
  listBlocks(@CurrentUser() user: AuthenticatedUser) {
    return this.conversations.listBlocks(user);
  }

  @Post(':userId/block')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Block a user' })
  block(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: BlockUserDto,
  ) {
    return this.conversations.blockUser(user, userId, body.reason);
  }

  @Delete(':userId/block')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Unblock a user' })
  unblock(@Param('userId') userId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversations.unblockUser(user, userId);
  }
}
