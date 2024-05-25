import { Module } from '@nestjs/common';
import { FoodCategoriesService } from './food-categories.service';
import { FoodCategoriesController } from './food-categories.controller';
import { PrismaService } from '../../services/database/prisma.service';

@Module({
  controllers: [FoodCategoriesController],
  providers: [FoodCategoriesService, PrismaService],
})
export class FoodCategoriesModule {}
