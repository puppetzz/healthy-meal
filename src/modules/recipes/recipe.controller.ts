import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GetRecipeDTO } from '../../common/dto/recipes/get-recipe.dto';
import { CreateRecipeDTO } from '../../common/dto/recipes/create-recipes.dto';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { AuthUser } from '../../decorators/auth.decorator';

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

  @Get(':id')
  public async getRecipeById(@Param('id') id: number) {
    const postId = Number(id);
    return this.recipeService.getRecipeById(postId);
  }

  @Post()
  @UseGuards(FirebaseGuard)
  public async createRecipe(
    @AuthUser('uid') userId: string,
    @Body() createRecipeDTO: CreateRecipeDTO,
  ) {
    return this.recipeService.createRecipe(userId, createRecipeDTO);
  }
}
