import { Injectable } from '@nestjs/common';
import {
  ChatMessageStatus,
  ChatMessageType,
  Prisma,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

const participantSelect = {
  id: true,
  userId: true,
  unreadCount: true,
  lastReadAt: true,
  lastDeliveredAt: true,
  mutedUntil: true,
  archivedAt: true,
  hiddenAt: true,
  joinedAt: true,
  user: {
    select: {
      id: true,
      displayName: true,
      phone: true,
      email: true,
    },
  },
} satisfies Prisma.ConversationParticipantSelect;

const conversationInclude = {
  participants: { select: participantSelect },
  listing: {
    select: {
      id: true,
      slug: true,
      domain: true,
      status: true,
      primaryPrice: true,
      sellerId: true,
      translations: { select: { title: true, language: true } },
    },
  },
  dealerOrganization: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      verified: true,
    },
  },
} satisfies Prisma.ConversationInclude;

@Injectable()
export class CommunicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  get client() {
    return this.prisma;
  }

  findListingById(listingId: string) {
    return this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
      select: {
        id: true,
        sellerId: true,
        domain: true,
        status: true,
        translations: { select: { title: true, language: true } },
      },
    });
  }

  findDealerOrganization(organizationId: string) {
    return this.prisma.dealerOrganization.findFirst({
      where: { id: organizationId, deletedAt: null },
      include: {
        members: { select: { userId: true } },
      },
    });
  }

  findListingConversation(listingId: string, participantIds: string[]) {
    return this.prisma.conversation.findFirst({
      where: {
        listingId,
        deletedAt: null,
        participants: {
          every: { userId: { in: participantIds } },
        },
        AND: participantIds.map((userId) => ({
          participants: { some: { userId } },
        })),
      },
      include: conversationInclude,
    });
  }

  findDealerConversation(organizationId: string, userId: string) {
    return this.prisma.conversation.findFirst({
      where: {
        dealerOrganizationId: organizationId,
        deletedAt: null,
        participants: { some: { userId } },
      },
      include: conversationInclude,
    });
  }

  createConversation(data: Prisma.ConversationCreateInput) {
    return this.prisma.conversation.create({
      data,
      include: conversationInclude,
    });
  }

  findConversationById(id: string) {
    return this.prisma.conversation.findFirst({
      where: { id, deletedAt: null },
      include: conversationInclude,
    });
  }

  findParticipant(conversationId: string, userId: string) {
    return this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
  }

  updateParticipant(
    conversationId: string,
    userId: string,
    data: Prisma.ConversationParticipantUpdateInput,
  ) {
    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data,
    });
  }

  async inboxForUser(
    userId: string,
    query: {
      q?: string;
      unreadOnly?: boolean;
      archived?: boolean;
      skip: number;
      take: number;
    },
  ) {
    const participantWhere: Prisma.ConversationParticipantWhereInput = {
      userId,
      hiddenAt: null,
      ...(query.unreadOnly ? { unreadCount: { gt: 0 } } : {}),
      ...(query.archived === true
        ? { archivedAt: { not: null } }
        : query.archived === false
          ? { archivedAt: null }
          : {}),
    };

    const where: Prisma.ConversationWhereInput = {
      deletedAt: null,
      participants: { some: participantWhere },
      ...(query.q?.trim()
        ? {
            OR: [
              { lastMessagePreview: { contains: query.q.trim(), mode: 'insensitive' } },
              {
                participants: {
                  some: {
                    user: {
                      displayName: { contains: query.q.trim(), mode: 'insensitive' },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, items, unreadAggregate] = await Promise.all([
      this.prisma.conversation.count({ where }),
      this.prisma.conversation.findMany({
        where,
        include: conversationInclude,
        orderBy: { lastMessageAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.conversationParticipant.aggregate({
        where: { userId, hiddenAt: null, unreadCount: { gt: 0 } },
        _sum: { unreadCount: true },
      }),
    ]);

    return {
      total,
      items,
      totalUnread: unreadAggregate._sum.unreadCount ?? 0,
    };
  }

  findMessageByClientId(conversationId: string, clientId: string) {
    return this.prisma.chatMessage.findUnique({
      where: { conversationId_clientId: { conversationId, clientId } },
    });
  }

  createMessage(data: Prisma.ChatMessageCreateInput) {
    return this.prisma.chatMessage.create({ data });
  }

  listMessages(
    conversationId: string,
    opts: {
      take: number;
      skip?: number;
      before?: Date;
      after?: Date;
    },
  ) {
    const where: Prisma.ChatMessageWhereInput = {
      conversationId,
      deletedAt: null,
      ...(opts.before ? { createdAt: { lt: opts.before } } : {}),
      ...(opts.after ? { createdAt: { gt: opts.after } } : {}),
    };

    return this.prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: opts.take,
      skip: opts.skip,
      include: {
        sender: {
          select: { id: true, displayName: true },
        },
      },
    });
  }

  countMessages(conversationId: string, before?: Date, after?: Date) {
    return this.prisma.chatMessage.count({
      where: {
        conversationId,
        deletedAt: null,
        ...(before ? { createdAt: { lt: before } } : {}),
        ...(after ? { createdAt: { gt: after } } : {}),
      },
    });
  }

  incrementUnreadForOthers(conversationId: string, senderId: string) {
    return this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: { not: senderId } },
      data: { unreadCount: { increment: 1 } },
    });
  }

  resetUnread(conversationId: string, userId: string) {
    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });
  }

  markMessagesRead(conversationId: string, readerId: string) {
    return this.prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: readerId },
        status: { in: [ChatMessageStatus.SENT, ChatMessageStatus.DELIVERED] },
        deletedAt: null,
      },
      data: { status: ChatMessageStatus.READ },
    });
  }

  markMessagesDelivered(conversationId: string, recipientId: string) {
    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: recipientId } },
      data: { lastDeliveredAt: new Date() },
    });
  }

  markUndeliveredAsDelivered(conversationId: string, recipientId: string) {
    return this.prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: recipientId },
        status: ChatMessageStatus.SENT,
        deletedAt: null,
      },
      data: { status: ChatMessageStatus.DELIVERED },
    });
  }

  isBlockedEitherWay(userA: string, userB: string) {
    return this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userA, blockedId: userB },
          { blockerId: userB, blockedId: userA },
        ],
      },
    });
  }

  createBlock(blockerId: string, blockedId: string, reason?: string) {
    return this.prisma.userBlock.create({
      data: { blockerId, blockedId, reason },
    });
  }

  deleteBlock(blockerId: string, blockedId: string) {
    return this.prisma.userBlock.delete({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });
  }

  listBlocks(blockerId: string) {
    return this.prisma.userBlock.findMany({
      where: { blockerId },
      include: {
        blocked: { select: { id: true, displayName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createDealerFollow(userId: string, organizationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const follow = await tx.dealerFollow.create({
        data: { userId, organizationId },
      });
      await tx.dealerOrganization.update({
        where: { id: organizationId },
        data: { followersCount: { increment: 1 } },
      });
      return follow;
    });
  }

  deleteDealerFollow(userId: string, organizationId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.dealerFollow.delete({
        where: { userId_organizationId: { userId, organizationId } },
      });
      await tx.dealerOrganization.update({
        where: { id: organizationId },
        data: { followersCount: { decrement: 1 } },
      });
    });
  }

  findDealerFollow(userId: string, organizationId: string) {
    return this.prisma.dealerFollow.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
  }

  upsertPresence(userId: string, isOnline: boolean) {
    return this.prisma.userPresence.upsert({
      where: { userId },
      create: { userId, isOnline, lastSeenAt: new Date() },
      update: {
        isOnline,
        lastSeenAt: isOnline ? undefined : new Date(),
      },
    });
  }

  getPresence(userIds: string[]) {
    return this.prisma.userPresence.findMany({
      where: { userId: { in: userIds } },
    });
  }

  createConversationReport(data: {
    conversationId: string;
    reporterId: string;
    reason: Prisma.ConversationReportCreateInput['reason'];
    details?: string;
  }) {
    return this.prisma.conversationReport.create({ data });
  }

  softDeleteMessage(messageId: string) {
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  hideConversationForUser(conversationId: string, userId: string) {
    return this.updateParticipant(conversationId, userId, {
      hiddenAt: new Date(),
    });
  }

  buildMessagePreview(type: ChatMessageType, body?: string | null): string {
    if (body?.trim()) {
      return body.trim().slice(0, 120);
    }
    switch (type) {
      case ChatMessageType.IMAGE:
        return '📷 Image';
      case ChatMessageType.LOCATION:
        return '📍 Location';
      case ChatMessageType.LISTING_CARD:
        return '🚗 Listing';
      case ChatMessageType.DEALER_CARD:
        return '🏢 Dealer';
      case ChatMessageType.CONTACT_CARD:
        return '📇 Contact';
      case ChatMessageType.SYSTEM:
        return 'System message';
      default:
        return '';
    }
  }
}

export { conversationInclude, participantSelect };
