import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { ConversationsService } from './application/conversations.service';
import { PresenceService } from './application/presence.service';
import { CommunicationRepository } from './infrastructure/communication.repository';
import { ConversationsController } from './presentation/conversations.controller';
import { UsersBlocksController } from './presentation/users-blocks.controller';
import { DealersFollowController } from './presentation/dealers-follow.controller';
import { ChatGateway } from './presentation/chat.gateway';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [
    ConversationsController,
    UsersBlocksController,
    DealersFollowController,
  ],
  providers: [
    CommunicationRepository,
    ConversationsService,
    PresenceService,
    ChatGateway,
  ],
  exports: [ConversationsService, CommunicationRepository, PresenceService],
})
export class CommunicationModule {}
