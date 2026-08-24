// src/socket/socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', process.env.FRONTEND_URL || 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/ws',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 [Socket.io] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ [Socket.io] Client disconnected: ${client.id}`);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}