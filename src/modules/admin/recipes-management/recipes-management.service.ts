import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/database/prisma.service';
import { Post, PostStatus, Prisma } from '@prisma/client';
import { TResponse } from '../../../types/response-type';
import { TPostPagination } from '../../../types/post-pagination.type';
import { GetRecipeDTO } from '../../../common/dto/recipes/get-recipe.dto';
import { ERecipesSearchOption } from '../../../common/enums/recipes-search-option';
import { CreateRecipeDTO } from '../../../common/dto/recipes/create-recipes.dto';
import { UpdateRecipeDTO } from '../../../common/dto/recipes/update-recipe.dto';

@Injectable()
export class RecipesManagementService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getRecipes(
    getRecipeDTO: GetRecipeDTO,
  ): Promise<TResponse<TPostPagination>> {
    const { page, pageSize, categoryId, search, searchBy } = getRecipeDTO;

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

    const whereWithFilter = this.handleFilterCondition(getRecipeDTO);

    const searchFilter = this.handleSearchOption(searchBy, search);

    const recipes = await this.prismaService.post.findMany({
      where: {
        ...where,
        ...searchFilter,
        ...whereWithFilter,
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
      skip,
      take: pageSize,
    });

    const numberOfRecipes = await this.prismaService.post.count({
      where: {
        ...where,
        ...searchFilter,
        ...whereWithFilter,
      },
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

  public async updateRecipe(
    userId: string,
    updateRecipeDTO: UpdateRecipeDTO,
  ): Promise<TResponse<null>> {
    const post = await this.prismaService.post.findFirst({
      where: {
        id: updateRecipeDTO.id,
      },
      include: {
        recipe: true,
      },
    });

    if (!post) throw new BadRequestException('You are not the owner of recipe');

    this.prismaService.$transaction(async (tx) => {
      const recipe = await tx.recipe.update({
        where: {
          id: post.recipe.id,
        },
        data: {
          prepTime: updateRecipeDTO.prepTime,
          cookTime: updateRecipeDTO.cookTime,
          servings: updateRecipeDTO.servings,
          keeping: updateRecipeDTO.keeping,
          freezer: updateRecipeDTO.freezer,
          calculationUnit: updateRecipeDTO.calculationUnit,
        },
      });

      await tx.recipeFoodCategory.deleteMany({
        where: {
          recipeId: post.recipe.id,
        },
      });

      await tx.recipeFoodCategory.createMany({
        data: updateRecipeDTO.foodCategoryIds.map((foodCategoryId) => ({
          recipeId: recipe.id,
          foodCategoryId: foodCategoryId,
        })),
      });

      await tx.ingredient.deleteMany({
        where: {
          recipeId: recipe.id,
        },
      });

      await tx.ingredient.createMany({
        data: updateRecipeDTO.ingredients.map((ingredient) => ({
          name: ingredient.name,
          description: ingredient.description,
          amount: ingredient.amount,
          unit: ingredient.unit,
          recipeId: recipe.id,
        })),
      });

      await tx.nutrition.update({
        where: {
          recipeId: recipe.id,
        },
        data: {
          calories: updateRecipeDTO.calories,
          protein: updateRecipeDTO.protein,
          carbohydrates: updateRecipeDTO.carbohydrates,
          fat: updateRecipeDTO.fat,
          recipeId: recipe.id,

          saturatedFat: updateRecipeDTO.saturatedFat,
          polyunsaturatedFat: updateRecipeDTO.polyunsaturatedFat,
          monounsaturatedFat: updateRecipeDTO.monounsaturatedFat,
          transFat: updateRecipeDTO.transFat,
          cholesterol: updateRecipeDTO.cholesterol,
          sodium: updateRecipeDTO.sodium,
          fiber: updateRecipeDTO.fiber,
          sugar: updateRecipeDTO.sugar,
          vitaminA: updateRecipeDTO.vitaminA,
          vitaminC: updateRecipeDTO.vitaminC,
          calcium: updateRecipeDTO.calcium,
          iron: updateRecipeDTO.iron,
          potassium: updateRecipeDTO.potassium,
        },
      });

      await tx.post.update({
        where: {
          id: post.id,
        },
        data: {
          thumbnail: updateRecipeDTO.thumbnail,
          title: updateRecipeDTO.title,
          content: updateRecipeDTO.content,
        },
      });
    });

    return {
      data: null,
      message: 'Update recipes successfully!',
      status: HttpStatus.OK,
    };
  }

  private handleSearchOption(
    searchBy: ERecipesSearchOption,
    search: string,
  ): Prisma.PostWhereInput {
    switch (searchBy) {
      case ERecipesSearchOption.TITLE:
        return {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        };
      case ERecipesSearchOption.AUTHOR:
        return {
          author: {
            fullName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        };
      default:
        return {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              author: {
                fullName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        };
    }
  }

  private handleFilterCondition(
    getRecipeDTO: GetRecipeDTO,
  ): Prisma.PostWhereInput {
    const { category, calories, protein, fat, carbs, sodium, fiber, sugar } =
      getRecipeDTO;

    const andPostRecipeNutritionCondition: Prisma.NutritionWhereInput[] = [];

    if (calories) {
      andPostRecipeNutritionCondition.push({
        calories: {
          gte: calories[0],
          lte: calories[1],
        },
      });
    }

    if (protein) {
      andPostRecipeNutritionCondition.push({
        protein: {
          gte: protein[0],
          lte: protein[1],
        },
      });
    }

    if (fat) {
      andPostRecipeNutritionCondition.push({
        fat: {
          gte: fat[0],
          lte: fat[1],
        },
      });
    }

    if (carbs) {
      andPostRecipeNutritionCondition.push({
        carbohydrates: {
          gte: carbs[0],
          lte: carbs[1],
        },
      });
    }

    if (sodium) {
      andPostRecipeNutritionCondition.push({
        sodium: {
          gte: sodium[0],
          lte: sodium[1],
        },
      });
    }

    if (fiber) {
      andPostRecipeNutritionCondition.push({
        fiber: {
          gte: fiber[0],
          lte: fiber[1],
        },
      });
    }

    if (sugar) {
      andPostRecipeNutritionCondition.push({
        sugar: {
          gte: sugar[0],
          lte: sugar[1],
        },
      });
    }

    return {
      recipe: {
        nutrition: {
          AND: [...andPostRecipeNutritionCondition],
        },
        recipeFoodCategory: category
          ? {
              some: {
                foodCategory: {
                  key: category,
                },
              },
            }
          : {},
      },
    };
  }
}
