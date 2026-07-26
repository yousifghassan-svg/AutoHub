import { ForbiddenException } from '@nestjs/common';
import {
  assertNotSelfChat,
  assertParticipantAccess,
  canModerateMessages,
  isParticipant,
} from './communication.policies';
import { Permission } from '../../auth/domain/permissions';

describe('communication.policies', () => {
  it('rejects self-chat', () => {
    expect(() => assertNotSelfChat('user-1', 'user-1')).toThrow(ForbiddenException);
  });

  it('allows chat when buyer differs from seller', () => {
    expect(() => assertNotSelfChat('user-1', 'user-2')).not.toThrow();
  });

  it('detects participant membership', () => {
    expect(isParticipant('a', ['a', 'b'])).toBe(true);
    expect(isParticipant('c', ['a', 'b'])).toBe(false);
  });

  it('allows moderators to access non-participant conversations', () => {
    expect(() =>
      assertParticipantAccess({
        actorId: 'mod-1',
        participantUserIds: ['a', 'b'],
        actorRole: 'MODERATOR',
        actorPermissions: [Permission.MESSAGES_MODERATE],
      }),
    ).not.toThrow();
  });

  it('rejects non-participant without moderate permission', () => {
    expect(() =>
      assertParticipantAccess({
        actorId: 'c',
        participantUserIds: ['a', 'b'],
        actorRole: 'USER',
        actorPermissions: [Permission.MESSAGES_READ],
      }),
    ).toThrow(ForbiddenException);
  });

  it('canModerateMessages for staff roles', () => {
    expect(
      canModerateMessages('MODERATOR', [Permission.MESSAGES_MODERATE]),
    ).toBe(true);
    expect(canModerateMessages('USER', [Permission.MESSAGES_READ])).toBe(false);
  });
});
