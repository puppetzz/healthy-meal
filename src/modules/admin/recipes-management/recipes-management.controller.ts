import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RecipesManagementService } from './recipes-management.service';
import { GetRecipeDTO } from '../../../common/dto/recipes/get-recipe.dto';
import { FirebaseGuard } from '../../auth/guards/firebase.guard';
import { AuthUser } from '../../../decorators/auth.decorator';
import { CreateRecipeDTO } from '../../../common/dto/recipes/create-recipes.dto';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { UpdateRecipeDTO } from '../../../common/dto/recipes/update-recipe.dto';
import { ReviewRecipeDTO } from '../../../common/dto/recipes/review-recipe.dto';

@Controller('/admin/recipes')
export class RecipesManagementController {
  constructor(
    private readonly recipesManagementService: RecipesManagementService,
  ) {}

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  public async getRecipes(@Query() getRecipeDTO: GetRecipeDTO) {
    const recipes =
      await this.recipesManagementService.getRecipes(getRecipeDTO);

    return recipes;
  }

  @Get(':id')
  public async getRecipeById(@Param('id') id: number) {
    return this.recipesManagementService.getRecipeById(Number(id));
  }
  @Post()
  @UseGuards(FirebaseGuard)
  public async createRecipe(
    @AuthUser('uid') userId: string,
    @Body() createRecipeDTO: CreateRecipeDTO,
  ) {
    try {
      return this.recipesManagementService.createRecipe(
        userId,
        createRecipeDTO,
      );
    } catch (error) {
      throw new BadRequestException('error');
    }
  }

  @Put()
  @UseGuards(AdminGuard)
  public async updateRecipe(
    @AuthUser('uid') userId: string,
    @Body() updateRecipeDTO: UpdateRecipeDTO,
  ) {
    return await this.recipesManagementService.updateRecipe(
      userId,
      updateRecipeDTO,
    );
  }

  @Put('review/:id')
  @UseGuards(AdminGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  public async reviewRecipe(
    @AuthUser('uid') userId: string,
    @Param('id') recipeId: string,
    @Body() data: ReviewRecipeDTO,
  ) {
    if (isNaN(parseInt(recipeId)))
      throw new BadRequestException('Invalid recipeId');

    return this.recipesManagementService.reviewRecipe(
      userId,
      Number(recipeId),
      data,
    );
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  public async deleteRecipe(@Param('id') id: string) {
    if (isNaN(Number(id))) throw new BadRequestException('Invalid recipeId');

    return this.recipesManagementService.deleteRecipe(Number(id));
  }
}
