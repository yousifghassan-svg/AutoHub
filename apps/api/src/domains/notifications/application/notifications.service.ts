import { Injectable } from '@nestjs/common';
import {
  AppNotificationType,
  ListingStatus,
  Prisma,
  PushPlatform,
} from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  async create(input: {
    userId: string;
    type: AppNotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    const notification = await this.prisma.appNotification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: (input.data ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    await this.push.sendToUser(input.userId, {
      title: input.title,
      body: input.body,
      data: input.data,
    });

    return notification;
  }

  async list(userId: string, query: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where = {
      userId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.appNotification.count({ where }),
      this.prisma.appNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { page, pageSize, total, items };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.appNotification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) return null;

    return this.prisma.appNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.appNotification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: PushPlatform = PushPlatform.EXPO,
  ) {
    return this.prisma.devicePushToken.upsert({
      where: { userId_token: { userId, token } },
      create: { userId, token, platform, lastUsedAt: new Date() },
      update: { platform, lastUsedAt: new Date() },
    });
  }

  async unregisterDeviceToken(userId: string, token: string) {
    try {
      await this.prisma.devicePushToken.delete({
        where: { userId_token: { userId, token } },
      });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  async notifyListingStatus(
    sellerId: string,
    listingId: string,
    status: ListingStatus,
  ): Promise<void> {
    if (status === ListingStatus.ACTIVE) {
      await this.create({
        userId: sellerId,
        type: AppNotificationType.LISTING_APPROVED,
        title: 'Listing approved',
        body: 'Your listing has been approved and is now live.',
        data: { listingId },
      });
      return;
    }

    if (status === ListingStatus.REJECTED) {
      await this.create({
        userId: sellerId,
        type: AppNotificationType.LISTING_REJECTED,
        title: 'Listing rejected',
        body: 'Your listing was rejected. Please review and resubmit.',
        data: { listingId },
      });
    }
  }

  /** Notify inquiry participants (and seller) when a listing price changes. */
  async notifyPriceChange(
    listingId: string,
    previousPrice: number,
    nextPrice: number,
  ): Promise<void> {
    const conversations = await this.prisma.conversation.findMany({
      where: { listingId, deletedAt: null },
      select: {
        participants: { select: { userId: true } },
      },
      take: 50,
    });
    const userIds = new Set<string>();
    for (const c of conversations) {
      for (const p of c.participants) userIds.add(p.userId);
    }
    const body = `Price changed from ${previousPrice} to ${nextPrice}.`;
    await Promise.all(
      [...userIds].map((userId) =>
        this.create({
          userId,
          type: AppNotificationType.PRICE_CHANGE,
          title: 'Price update',
          body,
          data: { listingId, previousPrice, nextPrice },
        }),
      ),
    );
  }

  async notifyFavouriteUpdate(userId: string, listingId: string, title: string) {
    await this.create({
      userId,
      type: AppNotificationType.FAVOURITE_UPDATE,
      title: 'Favourite update',
      body: title,
      data: { listingId },
    });
  }
}
