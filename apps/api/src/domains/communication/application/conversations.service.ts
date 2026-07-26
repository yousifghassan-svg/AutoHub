import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import {
  AppNotificationType,
  ChatMessageType,
  Prisma,
  ReportReason,
} from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import {
  MAX_INBOX_PAGE_SIZE,
  MAX_MESSAGES_PAGE_SIZE,
  MESSAGE_PREVIEW_MAX,
} from '../domain/communication.constants';
import {
  assertNotSelfChat,
  assertParticipantAccess,
} from '../domain/communication.policies';
import { detectSpam } from '../domain/spam-detection';
import { CommunicationRepository } from '../infrastructure/communication.repository';
import { NotificationsService } from '../../notifications/application/notifications.service';
import { ChatGateway } from '../presentation/chat.gateway';
import type {
  FirstMessageDto,
  InboxQueryDto,
  MessagesQueryDto,
  ReportConversationDto,
  SendMessageDto,
  StartDealerConversationDto,
  StartListingConversationDto,
  UpdateConversationDto,
} from '../presentation/dto/communication.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly repo: CommunicationRepository,
    private readonly notifications: NotificationsService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly gateway: ChatGateway,
  ) {}

  async startListingConversation(
    user: AuthenticatedUser,
    dto: StartListingConversationDto,
  ) {
    const listing = await this.repo.findListingById(dto.listingId);
    if (!listing) throw new NotFoundException('Listing not found');
    if (!listing.sellerId) {
      throw new BadRequestException('Listing has no seller');
    }

    assertNotSelfChat(user.id, listing.sellerId);

    const participantIds = [user.id, listing.sellerId];
    let conversation = await this.repo.findListingConversation(
      dto.listingId,
      participantIds,
    );

    if (!conversation) {
      conversation = await this.repo.createConversation({
        listing: { connect: { id: listing.id } },
        marketplaceDomain: listing.domain,
        createdById: user.id,
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      });
    }

    if (dto.firstMessage) {
      await this.sendMessageInternal(user, conversation.id, dto.firstMessage);
      conversation = (await this.repo.findConversationById(conversation.id))!;
    }

    return this.mapConversationDetail(conversation, user.id);
  }

  async startDealerConversation(
    user: AuthenticatedUser,
    dto: StartDealerConversationDto,
  ) {
    const org = await this.repo.findDealerOrganization(dto.organizationId);
    if (!org) throw new NotFoundException('Dealer not found');

    const memberIds = org.members.map((m) => m.userId);
    const dealerUserIds =
      memberIds.length > 0
        ? memberIds
        : org.createdById
          ? [org.createdById]
          : [];

    if (dealerUserIds.length === 0) {
      throw new BadRequestException('Dealer has no contact members');
    }

    if (dealerUserIds.includes(user.id) && dealerUserIds.length === 1) {
      throw new ForbiddenException('You cannot start a conversation with yourself');
    }

    let conversation = await this.repo.findDealerConversation(
      dto.organizationId,
      user.id,
    );

    if (!conversation) {
      const allParticipants = [...new Set([user.id, ...dealerUserIds])];
      conversation = await this.repo.createConversation({
        dealerOrganization: { connect: { id: org.id } },
        createdById: user.id,
        participants: {
          create: allParticipants.map((userId) => ({ userId })),
        },
      });
    }

    if (dto.firstMessage) {
      await this.sendMessageInternal(user, conversation.id, dto.firstMessage);
      conversation = (await this.repo.findConversationById(conversation.id))!;
    }

    return this.mapConversationDetail(conversation, user.id);
  }

  async getInbox(user: AuthenticatedUser, query: InboxQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, MAX_INBOX_PAGE_SIZE);
    const { total, items, totalUnread } = await this.repo.inboxForUser(
      user.id,
      {
        q: query.q,
        unreadOnly: query.unreadOnly,
        archived: query.archived,
        skip: (page - 1) * pageSize,
        take: pageSize,
      },
    );

    return {
      page,
      pageSize,
      total,
      totalUnread,
      items: items.map((c) => this.mapConversationSummary(c, user.id)),
    };
  }

  async getById(id: string, user: AuthenticatedUser) {
    const conversation = await this.requireConversation(id);
    this.assertAccess(conversation, user);

    const peerIds = conversation.participants
      .map((p) => p.userId)
      .filter((uid) => uid !== user.id);
    const presence = await this.repo.getPresence(peerIds);

    return {
      ...this.mapConversationDetail(conversation, user.id),
      peerPresence: presence.map((p) => ({
        userId: p.userId,
        isOnline: p.isOnline,
        lastSeenAt: p.lastSeenAt,
      })),
    };
  }

  async updateConversation(
    id: string,
    user: AuthenticatedUser,
    dto: UpdateConversationDto,
  ) {
    const conversation = await this.requireConversation(id);
    this.assertAccess(conversation, user);

    const participant = await this.repo.findParticipant(id, user.id);
    if (!participant) throw new ForbiddenException('Not a participant');

    const data: Record<string, unknown> = {};

    if (dto.archive) data.archivedAt = new Date();
    if (dto.unarchive) data.archivedAt = null;
    if (dto.mutedUntil) data.mutedUntil = new Date(dto.mutedUntil);
    if (dto.unmute) data.mutedUntil = null;
    if (dto.hide) data.hiddenAt = new Date();

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No update fields provided');
    }

    await this.repo.updateParticipant(id, user.id, data);
    this.gateway.emitConversationUpdated(id, { conversationId: id, userId: user.id });

    return this.getById(id, user);
  }

  async sendMessage(
    conversationId: string,
    user: AuthenticatedUser,
    dto: SendMessageDto,
  ) {
    const message = await this.sendMessageInternal(user, conversationId, dto);
    return this.mapMessage(message);
  }

  async getMessages(
    conversationId: string,
    user: AuthenticatedUser,
    query: MessagesQueryDto,
  ) {
    const conversation = await this.requireConversation(conversationId);
    this.assertAccess(conversation, user);

    const pageSize = Math.min(query.pageSize ?? 30, MAX_MESSAGES_PAGE_SIZE);
    const before = query.before ? new Date(query.before) : undefined;
    const after = query.after ? new Date(query.after) : undefined;

    if (before && after) {
      throw new BadRequestException('Use either before or after, not both');
    }

    const [items, total] = await Promise.all([
      this.repo.listMessages(conversationId, {
        take: pageSize,
        skip: query.before || query.after ? undefined : ((query.page ?? 1) - 1) * pageSize,
        before,
        after,
      }),
      this.repo.countMessages(conversationId, before, after),
    ]);

    return {
      page: query.page ?? 1,
      pageSize,
      total,
      items: items.map((m) => this.mapMessage(m)),
    };
  }

  async markRead(conversationId: string, user: AuthenticatedUser) {
    const conversation = await this.requireConversation(conversationId);
    this.assertAccess(conversation, user);

    await this.repo.resetUnread(conversationId, user.id);
    await this.repo.markMessagesRead(conversationId, user.id);

    this.gateway.emitMessageStatus(conversationId, {
      conversationId,
      readerId: user.id,
      status: 'READ',
    });
    this.gateway.emitConversationUpdated(conversationId, {
      conversationId,
      userId: user.id,
      unreadCount: 0,
    });

    return { ok: true };
  }

  async markDelivered(conversationId: string, user: AuthenticatedUser) {
    const conversation = await this.requireConversation(conversationId);
    this.assertAccess(conversation, user);

    await this.repo.markMessagesDelivered(conversationId, user.id);
    await this.repo.markUndeliveredAsDelivered(conversationId, user.id);

    this.gateway.emitMessageStatus(conversationId, {
      conversationId,
      readerId: user.id,
      status: 'DELIVERED',
    });

    return { ok: true };
  }

  async typing(
    conversationId: string,
    user: AuthenticatedUser,
    typing: boolean,
  ) {
    const conversation = await this.requireConversation(conversationId);
    this.assertAccess(conversation, user);

    this.gateway.emitTyping(conversationId, {
      conversationId,
      userId: user.id,
      typing,
    });

    return { ok: true };
  }

  async reportConversation(
    conversationId: string,
    user: AuthenticatedUser,
    dto: ReportConversationDto,
  ) {
    const conversation = await this.requireConversation(conversationId);
    this.assertAccess(conversation, user);

    const reason = dto.reason;
    if (!Object.values(ReportReason).includes(reason)) {
      throw new BadRequestException('Invalid report reason');
    }

    const report = await this.repo.createConversationReport({
      conversationId,
      reporterId: user.id,
      reason,
      details: dto.details,
    });

    return report;
  }

  async blockUser(
    blocker: AuthenticatedUser,
    blockedId: string,
    reason?: string,
  ) {
    if (blocker.id === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const existing = await this.repo.isBlockedEitherWay(blocker.id, blockedId);
    if (existing?.blockerId === blocker.id && existing.blockedId === blockedId) {
      return existing;
    }

    return this.repo.createBlock(blocker.id, blockedId, reason);
  }

  async unblockUser(blocker: AuthenticatedUser, blockedId: string) {
    try {
      await this.repo.deleteBlock(blocker.id, blockedId);
      return { ok: true };
    } catch {
      throw new NotFoundException('Block not found');
    }
  }

  async listBlocks(user: AuthenticatedUser) {
    const blocks = await this.repo.listBlocks(user.id);
    return { items: blocks };
  }

  async followDealer(user: AuthenticatedUser, organizationId: string) {
    const org = await this.repo.findDealerOrganization(organizationId);
    if (!org) throw new NotFoundException('Dealer not found');

    const existing = await this.repo.findDealerFollow(user.id, organizationId);
    if (existing) return { following: true, follow: existing };

    const follow = await this.repo.createDealerFollow(user.id, organizationId);
    return { following: true, follow };
  }

  async unfollowDealer(user: AuthenticatedUser, organizationId: string) {
    try {
      await this.repo.deleteDealerFollow(user.id, organizationId);
      return { following: false };
    } catch {
      throw new NotFoundException('Follow not found');
    }
  }

  async getFollowStatus(user: AuthenticatedUser, organizationId: string) {
    const follow = await this.repo.findDealerFollow(user.id, organizationId);
    return { following: Boolean(follow) };
  }

  private async sendMessageInternal(
    user: AuthenticatedUser,
    conversationId: string,
    dto: SendMessageDto | FirstMessageDto,
  ) {
    const conversation = await this.requireConversation(conversationId);
    this.assertAccess(conversation, user);

    const participant = conversation.participants.find((p) => p.userId === user.id);
    if (!participant) throw new ForbiddenException('Not a participant');

    const peerIds = conversation.participants
      .map((p) => p.userId)
      .filter((id) => id !== user.id);

    for (const peerId of peerIds) {
      const block = await this.repo.isBlockedEitherWay(user.id, peerId);
      if (block) {
        throw new ForbiddenException('Messaging is blocked between these users');
      }
    }

    if (dto.clientId) {
      const existing = await this.repo.findMessageByClientId(
        conversationId,
        dto.clientId,
      );
      if (existing) return existing;
    }

    const spam = detectSpam(dto.body);
    const preview = this.repo.buildMessagePreview(dto.type, dto.body);

    const message = await this.repo.createMessage({
      conversation: { connect: { id: conversationId } },
      sender: { connect: { id: user.id } },
      type: dto.type,
      body: dto.body,
      payload: dto.payload as Prisma.InputJsonValue | undefined,
      clientId: dto.clientId,
      flagged: spam.flagged,
      flagReason: spam.reason,
    });

    await this.repo.client.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: message.createdAt,
        lastMessagePreview: preview.slice(0, MESSAGE_PREVIEW_MAX),
      },
    });

    await this.repo.incrementUnreadForOthers(conversationId, user.id);

    const isDealerMember = await this.isDealerOrgMember(
      user.id,
      conversation.dealerOrganizationId,
    );

    for (const peerId of peerIds) {
      const peerParticipant = conversation.participants.find(
        (p) => p.userId === peerId,
      );
      const isMuted =
        peerParticipant?.mutedUntil &&
        peerParticipant.mutedUntil.getTime() > Date.now();

      if (!isMuted) {
        await this.notifications.create({
          userId: peerId,
          type: AppNotificationType.NEW_MESSAGE,
          title: user.displayName ?? 'New message',
          body: preview || 'You have a new message',
          data: { conversationId, messageId: message.id },
        });
      }

      if (isDealerMember) {
        await this.notifications.create({
          userId: peerId,
          type: AppNotificationType.DEALER_REPLY,
          title: 'Dealer reply',
          body: preview || 'A dealer replied to your inquiry',
          data: { conversationId, messageId: message.id },
        });
      }
    }

    const mapped = this.mapMessage(message);
    this.gateway.emitNewMessage(conversationId, mapped);
    this.gateway.emitConversationUpdated(conversationId, {
      conversationId,
      lastMessageAt: message.createdAt,
      lastMessagePreview: preview,
    });

    return message;
  }

  private async isDealerOrgMember(
    userId: string,
    organizationId: string | null | undefined,
  ): Promise<boolean> {
    if (!organizationId) return false;
    const org = await this.repo.findDealerOrganization(organizationId);
    if (!org) return false;
    return org.members.some((m) => m.userId === userId);
  }

  private async requireConversation(id: string) {
    const conversation = await this.repo.findConversationById(id);
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  private assertAccess(
    conversation: Awaited<ReturnType<CommunicationRepository['findConversationById']>> & {},
    user: AuthenticatedUser,
  ) {
    assertParticipantAccess({
      actorId: user.id,
      participantUserIds: conversation.participants.map((p) => p.userId),
      actorRole: user.role,
      actorPermissions: user.permissions,
    });
  }

  private mapConversationSummary(
    conversation: NonNullable<
      Awaited<ReturnType<CommunicationRepository['findConversationById']>>
    >,
    viewerId: string,
  ) {
    const self = conversation.participants.find((p) => p.userId === viewerId);
    const peers = conversation.participants.filter((p) => p.userId !== viewerId);

    return {
      id: conversation.id,
      listingId: conversation.listingId,
      dealerOrganizationId: conversation.dealerOrganizationId,
      marketplaceDomain: conversation.marketplaceDomain,
      status: conversation.status,
      lastMessageAt: conversation.lastMessageAt,
      lastMessagePreview: conversation.lastMessagePreview,
      unreadCount: self?.unreadCount ?? 0,
      archivedAt: self?.archivedAt ?? null,
      mutedUntil: self?.mutedUntil ?? null,
      listing: conversation.listing,
      dealerOrganization: conversation.dealerOrganization,
      peers: peers.map((p) => ({
        userId: p.userId,
        displayName: p.user.displayName,
      })),
    };
  }

  private mapConversationDetail(
    conversation: NonNullable<
      Awaited<ReturnType<CommunicationRepository['findConversationById']>>
    >,
    viewerId: string,
  ) {
    return {
      ...this.mapConversationSummary(conversation, viewerId),
      participants: conversation.participants.map((p) => ({
        userId: p.userId,
        displayName: p.user.displayName,
        phone: p.user.phone,
        unreadCount: p.unreadCount,
        lastReadAt: p.lastReadAt,
        joinedAt: p.joinedAt,
      })),
    };
  }

  private mapMessage(message: {
    id: string;
    conversationId: string;
    senderId: string | null;
    type: ChatMessageType;
    body: string | null;
    payload: unknown;
    clientId: string | null;
    status: string;
    flagged: boolean;
    flagReason: string | null;
    createdAt: Date;
    sender?: { id: string; displayName: string | null } | null;
  }) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: message.sender,
      type: message.type,
      body: message.body,
      payload: message.payload,
      clientId: message.clientId,
      status: message.status,
      flagged: message.flagged,
      flagReason: message.flagReason,
      createdAt: message.createdAt,
    };
  }
}
