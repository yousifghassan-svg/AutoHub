import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { ConversationsService } from '../application/conversations.service';
import {
  InboxQueryDto,
  MessagesQueryDto,
  ReportConversationDto,
  SendMessageDto,
  StartDealerConversationDto,
  StartListingConversationDto,
  TypingDto,
  UpdateConversationDto,
} from './dto/communication.dto';

@ApiTags('conversations')
@ApiBearerAuth('access-token')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Post('listing')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Start or get existing listing conversation' })
  startListing(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: StartListingConversationDto,
  ) {
    return this.conversations.startListingConversation(user, body);
  }

  @Post('dealer')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Start or get existing dealer conversation' })
  startDealer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: StartDealerConversationDto,
  ) {
    return this.conversations.startDealerConversation(user, body);
  }

  @Get()
  @Permissions(Permission.MESSAGES_READ)
  @ApiOperation({ summary: 'Inbox — own non-hidden conversations' })
  inbox(@CurrentUser() user: AuthenticatedUser, @Query() query: InboxQueryDto) {
    return this.conversations.getInbox(user, query);
  }

  @Get(':id')
  @Permissions(Permission.MESSAGES_READ)
  @ApiOperation({ summary: 'Conversation detail with peer presence' })
  detail(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversations.getById(id, user);
  }

  @Patch(':id')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Archive, mute, or hide conversation' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateConversationDto,
  ) {
    return this.conversations.updateConversation(id, user, body);
  }

  @Post(':id/messages')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SendMessageDto,
  ) {
    return this.conversations.sendMessage(id, user, body);
  }

  @Get(':id/messages')
  @Permissions(Permission.MESSAGES_READ)
  @ApiOperation({ summary: 'List messages (newest last)' })
  listMessages(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MessagesQueryDto,
  ) {
    return this.conversations.getMessages(id, user, query);
  }

  @Post(':id/read')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Mark conversation read' })
  markRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversations.markRead(id, user);
  }

  @Post(':id/delivered')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Mark messages delivered' })
  markDelivered(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversations.markDelivered(id, user);
  }

  @Post(':id/typing')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Typing indicator (HTTP fallback)' })
  typing(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: TypingDto,
  ) {
    return this.conversations.typing(id, user, body.typing);
  }

  @Post(':id/report')
  @Permissions(Permission.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Report conversation' })
  report(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ReportConversationDto,
  ) {
    return this.conversations.reportConversation(id, user, body);
  }
}
