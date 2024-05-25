import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GetRecipeDTO } from '../../common/dto/recipes/get-recipe.dto';

@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  public async getRecipes(@Query() GetRecipeDTO: GetRecipeDTO) {
    const recipes = await this.recipeService.getRecipes(GetRecipeDTO);

    return recipes;
  }
}
