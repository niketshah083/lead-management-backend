import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message, Lead } from '../../entities';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private userSockets;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinLead(client: Socket, leadId: string): {
        event: string;
        room: string;
    };
    handleLeaveLead(client: Socket, leadId: string): {
        event: string;
        room: string;
    };
    handleAuthenticate(client: Socket, userId: string): {
        event: string;
        userId: string;
    };
    notifyNewMessage(leadId: string, message: Message): void;
    emitNewMessage(leadId: string, message: Message): void;
    emitLeadUpdate(leadId: string, lead: Partial<Lead>): void;
    emitLeadClaimed(leadId: string, claimedBy: {
        id: string;
        name: string;
    }): void;
    emitSlaWarning(userId: string, slaStatus: any): void;
    emitSlaBreach(userId: string, slaStatus: any): void;
    emitNotification(userId: string, notification: any): void;
    broadcastNewLead(lead: Partial<Lead>, eligibleUserIds: string[]): void;
    private removeClientFromAllRooms;
}
