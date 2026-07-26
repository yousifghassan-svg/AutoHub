import { Injectable, Logger } from '@nestjs/common';
import { PushPlatform } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendToUser(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, unknown> },
  ): Promise<void> {
    const tokens = await this.prisma.devicePushToken.findMany({
      where: { userId },
    });

    if (tokens.length === 0) return;

    for (const entry of tokens) {
      await this.sendPush(entry.token, notification.title, notification.body, notification.data);
    }
  }

  async sendPush(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    if (token.startsWith('ExponentPushToken')) {
      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            title,
            body,
            data: data ?? {},
            sound: 'default',
          }),
        });

        if (!response.ok) {
          this.logger.warn(
            `Expo push failed (${response.status}) for token ${token.slice(0, 20)}…`,
          );
        } else {
          this.logger.log(`Expo push sent to ${token.slice(0, 24)}…`);
        }
      } catch (error) {
        this.logger.warn(`Expo push error: ${String(error)}`);
      }
      return;
    }

    this.logger.log(
      `[push stub] title="${title}" body="${body}" token=${token.slice(0, 16)}…`,
    );
  }
}

export { PushPlatform };
