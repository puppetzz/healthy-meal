import { Module } from '@nestjs/common';
import { RecipesManagementController } from './recipes-management.controller';
import { RecipesManagementService } from './recipes-management.service';
import { PrismaService } from '../../../services/database/prisma.service';

@Module({
  controllers: [RecipesManagementController],
  providers: [RecipesManagementService, PrismaService],
})
export class RecipesManagementModule {}
