import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReportStatus, ConversationStatus } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { CommunicationRepository } from '../../communication/infrastructure/communication.repository';
import type {
  AdminBlocksQueryDto,
  AdminCommunicationReportsQueryDto,
  ModerateConversationDto,
  ResolveConversationReportDto,
} from '../presentation/dto/admin-communication.dto';

@Injectable()
export class AdminCommunicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly communication: CommunicationRepository,
  ) {}

  async stats() {
    const [conversationCount, messageCount, openReports, blocks] =
      await Promise.all([
        this.prisma.conversation.count({ where: { deletedAt: null } }),
        this.prisma.chatMessage.count({ where: { deletedAt: null } }),
        this.prisma.conversationReport.count({
          where: { status: ReportStatus.OPEN },
        }),
        this.prisma.userBlock.count(),
      ]);

    return { conversationCount, messageCount, openReports, blocks };
  }

  async listReportedConversations(query: AdminCommunicationReportsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where: Prisma.ConversationReportWhereInput = {
      status: query.status,
    };

    const [total, items] = await Promise.all([
      this.prisma.conversationReport.count({ where }),
      this.prisma.conversationReport.findMany({
        where,
        include: {
          conversation: {
            include: {
              participants: {
                include: {
                  user: { select: { id: true, displayName: true, phone: true } },
                },
              },
            },
          },
          reporter: { select: { id: true, displayName: true } },
          resolvedBy: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { page, pageSize, total, items };
  }

  async resolveReport(
    reportId: string,
    actor: AuthenticatedUser,
    dto: ResolveConversationReportDto,
  ) {
    const report = await this.prisma.conversationReport.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    if (
      dto.status !== ReportStatus.RESOLVED &&
      dto.status !== ReportStatus.REJECTED
    ) {
      throw new BadRequestException('Status must be RESOLVED or REJECTED');
    }

    return this.prisma.conversationReport.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        resolution: dto.resolution,
        resolvedById: actor.id,
        resolvedAt: new Date(),
      },
    });
  }

  async listBlocks(query: AdminBlocksQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const [total, items] = await Promise.all([
      this.prisma.userBlock.count(),
      this.prisma.userBlock.findMany({
        include: {
          blocker: { select: { id: true, displayName: true } },
          blocked: { select: { id: true, displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { page, pageSize, total, items };
  }

  async moderate(actor: AuthenticatedUser, dto: ModerateConversationDto) {
    if (dto.action === 'hide_conversation') {
      if (!dto.conversationId) {
        throw new BadRequestException('conversationId required');
      }
      await this.prisma.conversation.update({
        where: { id: dto.conversationId },
        data: { deletedAt: new Date(), status: ConversationStatus.BLOCKED },
      });
      return { ok: true, action: dto.action };
    }

    if (dto.action === 'remove_message') {
      if (!dto.messageId) {
        throw new BadRequestException('messageId required');
      }
      await this.communication.softDeleteMessage(dto.messageId);
      return { ok: true, action: dto.action };
    }

    throw new BadRequestException('Unknown moderation action');
  }
}
