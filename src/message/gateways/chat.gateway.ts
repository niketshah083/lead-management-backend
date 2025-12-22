import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { Message, Lead } from '../../entities';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove client from all rooms and user mappings
    this.removeClientFromAllRooms(client);
  }

  @SubscribeMessage('join_lead')
  handleJoinLead(
    @ConnectedSocket() client: Socket,
    @MessageBody() leadId: string,
  ) {
    const room = `lead_${leadId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('leave_lead')
  handleLeaveLead(
    @ConnectedSocket() client: Socket,
    @MessageBody() leadId: string,
  ) {
    const room = `lead_${leadId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'left', room };
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    // Associate socket with user
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    // Join user-specific room for notifications
    client.join(`user_${userId}`);
    this.logger.log(`Client ${client.id} authenticated as user ${userId}`);
    return { event: 'authenticated', userId };
  }

  // Server-side emission methods

  /**
   * Notify clients about a new message (alias for emitNewMessage)
   */
  notifyNewMessage(leadId: string, message: Message) {
    this.emitNewMessage(leadId, message);
  }

  emitNewMessage(leadId: string, message: Message) {
    const room = `lead_${leadId}`;
    this.server.to(room).emit('new_message', message);
    this.logger.log(`Emitted new_message to room ${room}`);
  }

  emitLeadUpdate(leadId: string, lead: Partial<Lead>) {
    const room = `lead_${leadId}`;
    this.server.to(room).emit('lead_updated', lead);
    this.logger.log(`Emitted lead_updated to room ${room}`);
  }

  emitLeadClaimed(leadId: string, claimedBy: { id: string; name: string }) {
    const room = `lead_${leadId}`;
    this.server.to(room).emit('lead_claimed', { leadId, claimedBy });
    this.logger.log(`Emitted lead_claimed to room ${room}`);
  }

  emitSlaWarning(userId: string, slaStatus: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit('sla_warning', slaStatus);
    this.logger.log(`Emitted sla_warning to user ${userId}`);
  }

  emitSlaBreach(userId: string, slaStatus: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit('sla_breach', slaStatus);
    this.logger.log(`Emitted sla_breach to user ${userId}`);
  }

  emitNotification(userId: string, notification: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit('notification', notification);
    this.logger.log(`Emitted notification to user ${userId}`);
  }

  // Broadcast to all connected clients
  broadcastNewLead(lead: Partial<Lead>, eligibleUserIds: string[]) {
    for (const userId of eligibleUserIds) {
      const room = `user_${userId}`;
      this.server.to(room).emit('new_lead', lead);
    }
    this.logger.log(`Broadcasted new_lead to ${eligibleUserIds.length} users`);
  }

  private removeClientFromAllRooms(client: Socket) {
    // Remove from user mappings
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }
}
