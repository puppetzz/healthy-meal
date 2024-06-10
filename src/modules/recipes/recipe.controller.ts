import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
import { UpdateRecipeDTO } from '../../common/dto/recipes/update-recipe.dto';

@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  public async getRecipes(@Query() getRecipeDTO: GetRecipeDTO) {
    const recipes = await this.recipeService.getRecipes(getRecipeDTO);

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

  @Put()
  @UseGuards(FirebaseGuard)
  public async updateRecipe(
    @AuthUser('uid') userId: string,
    @Body() updateRecipeDTO: UpdateRecipeDTO,
  ) {
    return await this.recipeService.updateRecipe(userId, updateRecipeDTO);
  }
}
