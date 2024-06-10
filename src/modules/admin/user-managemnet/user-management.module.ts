import { Module } from '@nestjs/common';
import { UserManagementController } from './user-management.controller';
import { PrismaService } from '../../../services/database/prisma.service';
import { UserManagementService } from './user-management.service';

@Module({
  controllers: [UserManagementController],
  providers: [UserManagementService, PrismaService],
})
export class UserManagementModule {}
