import { ForbiddenException } from '@nestjs/common';
import type { UserRole } from '@autohub/database';
import type { Permission } from '../../auth/domain/permissions';
import { Permission as P } from '../../auth/domain/permissions';

export type ParticipantContext = {
  actorId: string;
  participantUserIds: string[];
  actorRole?: UserRole;
  actorPermissions?: Permission[];
};

export function canModerateMessages(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return (
    permissions.includes(P.MESSAGES_MODERATE) ||
    role === 'MODERATOR' ||
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN'
  );
}

export function isParticipant(
  actorId: string,
  participantUserIds: string[],
): boolean {
  return participantUserIds.includes(actorId);
}

export function assertNotSelfChat(buyerId: string, sellerId: string | null | undefined): void {
  if (sellerId && buyerId === sellerId) {
    throw new ForbiddenException('You cannot start a conversation with yourself');
  }
}

export function assertParticipantAccess(ctx: ParticipantContext): void {
  if (isParticipant(ctx.actorId, ctx.participantUserIds)) return;
  if (
    ctx.actorRole &&
    ctx.actorPermissions &&
    canModerateMessages(ctx.actorRole, ctx.actorPermissions)
  ) {
    return;
  }
  throw new ForbiddenException('Not a participant in this conversation');
}
