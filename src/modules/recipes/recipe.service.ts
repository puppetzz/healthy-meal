import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { TResponse } from '../../types/response-type';
import { Post, PostStatus, Prisma } from '@prisma/client';
import { GetRecipeDTO } from '../../common/dto/recipes/get-recipe.dto';
import { TPostPagination } from '../../types/post-pagination.type';
import { CreateRecipeDTO } from '../../common/dto/recipes/create-recipes.dto';

@Injectable()
export class RecipeService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getRecipes(
    GetRecipeDTO: GetRecipeDTO,
  ): Promise<TResponse<TPostPagination>> {
    const { page, pageSize, categoryId } = GetRecipeDTO;

    const skip = pageSize ? (page - 1) * pageSize : 0;
    const where: Prisma.PostWhereInput = categoryId
      ? {
          recipe: {
            recipeFoodCategory: {
              some: {
                foodCategoryId: categoryId,
              },
            },
          },
        }
      : {};

    const recipes = await this.prismaService.post.findMany({
      where,
      include: {
        recipe: {
          include: {
            recipeFoodCategory: {
              include: {
                foodCategory: true,
              },
            },
            nutrition: true,
          },
        },
      },
      skip,
      take: pageSize,
    });

    const numberOfRecipes = await this.prismaService.post.count({
      where: where,
    });

    const totalPage = Math.ceil(numberOfRecipes / pageSize);

    return {
      status: HttpStatus.OK,
      data: {
        data: recipes,
        page,
        total: totalPage,
      },
      message: 'Recipes fetched successfully!',
    };
  }

  public async getRecipeById(id: number): Promise<TResponse<Post>> {
    const recipe = await this.prismaService.post.findUnique({
      where: {
        id,
      },
      include: {
        recipe: {
          include: {
            recipeFoodCategory: {
              include: {
                foodCategory: true,
              },
            },
            nutrition: true,
            ingredient: true,
          },
        },
        author: true,
      },
    });

    return {
      status: HttpStatus.OK,
      data: recipe,
      message: 'Recipe fetched successfully!',
    };
  }

  public async createRecipe(
    userId: string,
    createRecipeDTO: CreateRecipeDTO,
  ): Promise<TResponse<null>> {
    if (
      createRecipeDTO.status !== 'draft' &&
      createRecipeDTO.status !== 'publish'
    ) {
      throw new BadRequestException('Invalid status');
    }

    this.prismaService.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          prepTime: createRecipeDTO.prepTime,
          cookTime: createRecipeDTO.cookTime,
          servings: createRecipeDTO.servings,
          keeping: createRecipeDTO.keeping,
          freezer: createRecipeDTO.freezer,
          calculationUnit: createRecipeDTO.calculationUnit,

          recipeFoodCategory: {
            create: createRecipeDTO.foodCategoryIds.map((foodCategoryId) => {
              return {
                foodCategoryId: foodCategoryId,
              };
            }),
          },
        },
      });

      createRecipeDTO.ingredients.forEach(async (ingredient) => {
        await tx.ingredient.create({
          data: {
            name: ingredient.name,
            description: ingredient.description,
            amount: ingredient.amount,
            unit: ingredient.unit,
            recipeId: recipe.id,
          },
        });
      });

      await tx.nutrition.create({
        data: {
          calories: createRecipeDTO.calories,
          protein: createRecipeDTO.protein,
          carbohydrates: createRecipeDTO.carbohydrates,
          fat: createRecipeDTO.fat,
          recipeId: recipe.id,

          saturatedFat: createRecipeDTO.saturatedFat,
          polyunsaturatedFat: createRecipeDTO.polyunsaturatedFat,
          monounsaturatedFat: createRecipeDTO.monounsaturatedFat,
          transFat: createRecipeDTO.transFat,
          cholesterol: createRecipeDTO.cholesterol,
          sodium: createRecipeDTO.sodium,
          fiber: createRecipeDTO.fiber,
          sugar: createRecipeDTO.sugar,
          vitaminA: createRecipeDTO.vitaminA,
          vitaminC: createRecipeDTO.vitaminC,
          calcium: createRecipeDTO.calcium,
          iron: createRecipeDTO.iron,
          potassium: createRecipeDTO.potassium,
        },
      });

      await tx.post.create({
        data: {
          authorId: userId,
          status:
            createRecipeDTO.status === 'publish'
              ? PostStatus.PENDING
              : PostStatus.DRAFT,
          thumbnail: createRecipeDTO.thumbnail,
          title: createRecipeDTO.title,
          content: createRecipeDTO.content,
          recipeId: recipe.id,
          postCategory: {
            create: createRecipeDTO.postCategoryIds.map((postCategoryId) => {
              return {
                categoryId: postCategoryId,
              };
            }),
          },
        },
      });
    });

    return {
      data: null,
      status: HttpStatus.CREATED,
      message: 'Recipe created successfully!',
    };
  }
}
