import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AdminWebSocketGuard } from '../auth/guards/admin-web-socket.guard';
import { WSAuthUser } from '../../decorators/auth-web-socket.decorator';

@WebSocketGateway(5001, { cors: true })
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('WS connected:', socket.id);
    });
  }

  @UseGuards(AdminWebSocketGuard)
  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() data: any,
    @WSAuthUser('uid') userId: string,
  ): string {
    console.log(data.message);
    this.server.emit('onMessage', data);
    return data;
  }
}
