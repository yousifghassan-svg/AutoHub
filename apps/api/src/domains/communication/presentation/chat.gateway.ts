import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Injectable, Logger, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { AppConfigService } from '../../../infrastructure/config/app-config.service';
import { UsersService } from '../../users/application/users.service';
import type { AccessTokenPayload, AuthenticatedUser } from '../../auth/domain/auth.types';
import { permissionsForRole } from '../../auth/domain/permissions';
import { PresenceService } from '../application/presence.service';
import { ConversationsService } from '../application/conversations.service';
import type { SendMessageDto } from './dto/communication.dto';

type AuthedSocket = Socket & { user?: AuthenticatedUser };

@Injectable()
@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwt: JwtService,
    private readonly appConfig: AppConfigService,
    private readonly users: UsersService,
    private readonly presence: PresenceService,
    @Inject(forwardRef(() => ConversationsService))
    private readonly conversations: ConversationsService,
  ) {}

  async handleConnection(client: AuthedSocket): Promise<void> {
    try {
      const user = await this.authenticate(client);
      client.user = user;
      this.trackSocket(user.id, client.id);
      await this.presence.setOnline(user.id);
      this.broadcastPresence(user.id, true);
      this.logger.debug(`Client connected: ${user.id}`);
    } catch (error) {
      this.logger.warn(`WS auth failed: ${String(error)}`);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: AuthedSocket): Promise<void> {
    const userId = client.user?.id;
    if (!userId) return;

    this.untrackSocket(userId, client.id);
    const stillConnected = this.userSockets.has(userId);
    if (!stillConnected) {
      await this.presence.setOffline(userId);
      this.broadcastPresence(userId, false);
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { conversationId: string },
  ) {
    if (!client.user) throw new UnauthorizedException();
    client.join(this.room(payload.conversationId));
    return { ok: true };
  }

  @SubscribeMessage('leave_conversation')
  handleLeave(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { conversationId: string },
  ) {
    client.leave(this.room(payload.conversationId));
    return { ok: true };
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { conversationId: string },
  ) {
    if (!client.user) throw new UnauthorizedException();
    await this.conversations.typing(payload.conversationId, client.user, true);
    return { ok: true };
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { conversationId: string },
  ) {
    if (!client.user) throw new UnauthorizedException();
    await this.conversations.typing(payload.conversationId, client.user, false);
    return { ok: true };
  }

  @SubscribeMessage('message_send')
  async handleMessageSend(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: SendMessageDto & { conversationId: string },
  ) {
    if (!client.user) throw new UnauthorizedException();
    const { conversationId, ...dto } = payload;
    return this.conversations.sendMessage(conversationId, client.user, dto);
  }

  @SubscribeMessage('presence')
  async handlePresencePing(@ConnectedSocket() client: AuthedSocket) {
    if (!client.user) throw new UnauthorizedException();
    await this.presence.setOnline(client.user.id);
    return { ok: true, isOnline: true };
  }

  emitNewMessage(conversationId: string, message: unknown) {
    this.server.to(this.room(conversationId)).emit('message:new', message);
  }

  emitMessageStatus(conversationId: string, payload: unknown) {
    this.server.to(this.room(conversationId)).emit('message:status', payload);
  }

  emitTyping(conversationId: string, payload: unknown) {
    this.server
      .to(this.room(conversationId))
      .emit('typing', payload);
  }

  emitConversationUpdated(conversationId: string, payload: unknown) {
    this.server
      .to(this.room(conversationId))
      .emit('conversation:updated', payload);
  }

  private broadcastPresence(userId: string, isOnline: boolean) {
    this.server.emit('presence:update', { userId, isOnline, lastSeenAt: new Date() });
  }

  private room(conversationId: string) {
    return `conversation:${conversationId}`;
  }

  private trackSocket(userId: string, socketId: string) {
    const set = this.userSockets.get(userId) ?? new Set<string>();
    set.add(socketId);
    this.userSockets.set(userId, set);
  }

  private untrackSocket(userId: string, socketId: string) {
    const set = this.userSockets.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) this.userSockets.delete(userId);
  }

  private async authenticate(client: AuthedSocket): Promise<AuthenticatedUser> {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      extractBearerFromHeader(client.handshake.headers.authorization);

    if (!token) throw new UnauthorizedException('Missing token');

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.appConfig.app.jwt.accessSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.users.findActiveById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      phone: user.phone,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      permissions: permissionsForRole(user.role),
      status: user.status,
    };
  }
}

function extractBearerFromHeader(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;
  return token;
}
