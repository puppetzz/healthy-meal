import { Module } from '@nestjs/common';
import { MealPlanController } from './meal-plan.controller';
import { MealPlanService } from './meal-plan.service';
import { PrismaService } from '../../services/database/prisma.service';

@Module({
  controllers: [MealPlanController],
  providers: [MealPlanService, PrismaService],
})
export class MealPlanModule {}
