import { Controller, Get } from '@nestjs/common';
import { RecipeService } from './recipe.service';

@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get('')
  public async getRecipes() {
    const recipes = await this.recipeService.getRecipes();

    return recipes;
  }
}
