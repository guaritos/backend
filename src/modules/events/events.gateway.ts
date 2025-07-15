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
import { SocketEvent } from './types';
import { SOCKET_EVENTS } from './consts';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
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
  ): string {
    if (!userId) {
      return "User ID is required to subscribe to events";
    }
    client.join(userId);
    return "Subscribed to user events";
  }

  
  sendEventToUser(userId: string, event: SocketEvent, type: "info" | "error", data: any): void {
    if (!userId || !event) {
      console.error('User ID or event type is missing');
      return;
    }
    if (!this.isValidSocketEvent(event)) {
      console.error(`Invalid socket event: ${event}`);
      console.log(`Valid events are: ${SOCKET_EVENTS.join(', ')}`);
      return;
    }
    
    this.server.to(userId).emit(event, {
      type,
      data,
      timestamp: new Date().toISOString(),
    });
    console.log(`Event sent to user ${userId}:`, event);
  }

  private isValidSocketEvent(event: string): event is SocketEvent {
    return SOCKET_EVENTS.includes(event as SocketEvent);
  }
}
