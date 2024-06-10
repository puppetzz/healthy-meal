import { Module } from '@nestjs/common';
import { MealPlanManagementController } from './meal-plan-management.controller';
import { MealPlanManagementService } from './meal-plan-management.service';
import { PrismaService } from '../../../services/database/prisma.service';

@Module({
  controllers: [MealPlanManagementController],
  providers: [MealPlanManagementService, PrismaService],
})
export class MealPlanManagementModule {}
