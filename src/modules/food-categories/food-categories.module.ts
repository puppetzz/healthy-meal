import { Module } from '@nestjs/common';
import { FoodCategoriesService } from './food-categories.service';
import { DrizzleModule } from '../../drizzle/drizzle.module';
import { FoodCategoriesController } from './food-categories.controller';

@Module({
  imports: [DrizzleModule],
  controllers: [FoodCategoriesController],
  providers: [FoodCategoriesService],
})
export class FoodCategoriesModule {}
