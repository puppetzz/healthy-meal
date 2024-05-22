import { Controller, Get } from '@nestjs/common';
import { FoodCategoriesService } from './food-categories.service';

@Controller('food-categories')
export class FoodCategoriesController {
  constructor(private readonly foodCategoriesService: FoodCategoriesService) {}

  @Get()
  public async getFoodCategories() {
    return this.foodCategoriesService.getFoodCategories();
  }
}
