import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}
}
