import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly foodCategoriesService: CategoriesService) {}

  @Get('foods')
  public async getFoodCategories() {
    return this.foodCategoriesService.getFoodCategories();
  }

  @Get('posts')
  public async getPostCategories() {
    return this.foodCategoriesService.getPostCategories();
  }
}
