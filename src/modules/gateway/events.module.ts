import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PrismaService } from '../../services/database/prisma.service';

@Module({
  providers: [EventsGateway, PrismaService],
  exports: [EventsGateway],
})
export class EventsModule {}
