import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for CORS
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('event')
  handleEvent(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(userId);
  }

  sendEventToUser(userId: string, event: string, data: any): void {
    this.server.to(userId).emit(event, data);
    console.log(`Event sent to user ${userId}:`, event, data);
  }
}
