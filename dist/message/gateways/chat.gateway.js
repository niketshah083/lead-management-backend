"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    userSockets = new Map();
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.removeClientFromAllRooms(client);
    }
    handleJoinLead(client, leadId) {
        const room = `lead_${leadId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);
        return { event: 'joined', room };
    }
    handleLeaveLead(client, leadId) {
        const room = `lead_${leadId}`;
        client.leave(room);
        this.logger.log(`Client ${client.id} left room ${room}`);
        return { event: 'left', room };
    }
    handleAuthenticate(client, userId) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(client.id);
        client.join(`user_${userId}`);
        this.logger.log(`Client ${client.id} authenticated as user ${userId}`);
        return { event: 'authenticated', userId };
    }
    notifyNewMessage(leadId, message) {
        this.emitNewMessage(leadId, message);
    }
    emitNewMessage(leadId, message) {
        const room = `lead_${leadId}`;
        this.server.to(room).emit('new_message', message);
        this.logger.log(`Emitted new_message to room ${room}`);
    }
    emitLeadUpdate(leadId, lead) {
        const room = `lead_${leadId}`;
        this.server.to(room).emit('lead_updated', lead);
        this.logger.log(`Emitted lead_updated to room ${room}`);
    }
    emitLeadClaimed(leadId, claimedBy) {
        const room = `lead_${leadId}`;
        this.server.to(room).emit('lead_claimed', { leadId, claimedBy });
        this.logger.log(`Emitted lead_claimed to room ${room}`);
    }
    emitSlaWarning(userId, slaStatus) {
        const room = `user_${userId}`;
        this.server.to(room).emit('sla_warning', slaStatus);
        this.logger.log(`Emitted sla_warning to user ${userId}`);
    }
    emitSlaBreach(userId, slaStatus) {
        const room = `user_${userId}`;
        this.server.to(room).emit('sla_breach', slaStatus);
        this.logger.log(`Emitted sla_breach to user ${userId}`);
    }
    emitNotification(userId, notification) {
        const room = `user_${userId}`;
        this.server.to(room).emit('notification', notification);
        this.logger.log(`Emitted notification to user ${userId}`);
    }
    broadcastNewLead(lead, eligibleUserIds) {
        for (const userId of eligibleUserIds) {
            const room = `user_${userId}`;
            this.server.to(room).emit('new_lead', lead);
        }
        this.logger.log(`Broadcasted new_lead to ${eligibleUserIds.length} users`);
    }
    removeClientFromAllRooms(client) {
        for (const [userId, sockets] of this.userSockets.entries()) {
            if (sockets.has(client.id)) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                }
            }
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_lead'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinLead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_lead'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveLead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('authenticate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleAuthenticate", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: {
            origin: '*',
            credentials: true,
        },
    })
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map