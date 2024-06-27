import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/database/prisma.service';
import { Post, PostStatus, Prisma } from '@prisma/client';
import { TResponse } from '../../../types/response-type';
import { GetRecipeDTO } from '../../../common/dto/recipes/get-recipe.dto';
import { ERecipesSearchOption } from '../../../common/enums/recipes-search-option';
import { CreateRecipeDTO } from '../../../common/dto/recipes/create-recipes.dto';
import { UpdateRecipeDTO } from '../../../common/dto/recipes/update-recipe.dto';
import { TRecipePagination } from '../../../types/recipe-pagination';
import { ECreateStatus } from '../../../common/enums/create-status.enum';
import { ReviewRecipeDTO } from '../../../common/dto/recipes/review-recipe.dto';
import { EReviewRecipeStatus } from '../../../common/enums/review-recipe-status.enum';
import { CALORIES } from '../../../common/constants/nutrition';

@Injectable()
export class RecipesManagementService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getRecipes(
    getRecipeDTO: GetRecipeDTO,
  ): Promise<TResponse<TRecipePagination>> {
    const { page, pageSize, search, searchBy } = getRecipeDTO;

    const skip = pageSize ? (page - 1) * pageSize : 0;

    const whereWithFilter = this.handleFilterCondition(getRecipeDTO);

    const searchFilter = this.handleSearchOption(searchBy, search);

    const recipes = await this.prismaService.recipe.findMany({
      where: {
        ...searchFilter,
        ...whereWithFilter,
      },
      include: {
        recipeFoodCategory: {
          include: {
            foodCategory: true,
          },
        },
        nutrition: true,
        ingredient: true,
        post: {
          include: {
            author: true,
          },
        },
      },
      skip,
      take: pageSize,
    });

    const numberOfRecipes = await this.prismaService.recipe.count({
      where: {
        ...searchFilter,
        ...whereWithFilter,
      },
    });

    const totalPage = Math.ceil(numberOfRecipes / pageSize);

    return {
      status: HttpStatus.OK,
      data: {
        recipes: recipes,
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
      createRecipeDTO.status !== ECreateStatus.DRAFT &&
      createRecipeDTO.status !== ECreateStatus.PUBLISH
    ) {
      throw new BadRequestException('Invalid status');
    }

    if (
      !createRecipeDTO.calories ||
      !createRecipeDTO.protein ||
      !createRecipeDTO.carbohydrates ||
      !createRecipeDTO.fat
    )
      throw new BadRequestException(
        'Bạn phải nhập các chất dinh dưỡng được yêu cầu',
      );

    if (createRecipeDTO.calories > 2500 || createRecipeDTO.calories < 0)
      throw new BadRequestException('Lượng calo vượt quá ngưỡng cho phép!');

    if (createRecipeDTO.protein > 80 || createRecipeDTO.protein < 0)
      throw new BadRequestException('Lượng protein vượt quá ngưỡng cho phép!');

    if (createRecipeDTO.fat > 70 || createRecipeDTO.fat < 0)
      throw new BadRequestException('Lượng chất béo vượt quá ngưỡng cho phép!');
    if (
      createRecipeDTO.carbohydrates > 100 ||
      createRecipeDTO.carbohydrates < 0
    )
      throw new BadRequestException('Lượng calo vượt quá ngưỡng cho phép!');
    if (createRecipeDTO.sodium > 1900 || createRecipeDTO.sodium < 0)
      throw new BadRequestException('Lượng natri vượt quá ngưỡng cho phép!');

    if (createRecipeDTO.fiber > 50 || createRecipeDTO.fiber < 0)
      throw new BadRequestException('Lượng chất xơ vượt quá ngưỡng cho phép!');

    if (createRecipeDTO.sugar > 50 || createRecipeDTO.sugar < 0)
      throw new BadRequestException('Lượng đường vượt quá ngưỡng cho phép!');

    const calCalories =
      createRecipeDTO.protein * CALORIES.PROTEIN +
      createRecipeDTO.fat * CALORIES.FAT +
      createRecipeDTO.carbohydrates * CALORIES.CARBS +
      createRecipeDTO.fiber * CALORIES.FIBER +
      createRecipeDTO.sugar * CALORIES.SUGAR;

    if (Math.abs(calCalories - createRecipeDTO.calories) > 50)
      throw new BadRequestException(
        'The calories not math with the nutrition!',
      );

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

      const postCategory = await tx.category.findFirst({
        where: {
          key: 'recipe',
        },
      });

      await tx.post.create({
        data: {
          authorId: userId,
          status:
            createRecipeDTO.status === ECreateStatus.PUBLISH
              ? PostStatus.PENDING
              : PostStatus.DRAFT,
          thumbnail: createRecipeDTO.thumbnail,
          title: createRecipeDTO.title,
          content: createRecipeDTO.content,
          recipeId: recipe.id,
          postCategory: {
            create: {
              categoryId: postCategory.id,
            },
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

    if (
      !updateRecipeDTO.calories ||
      !updateRecipeDTO.protein ||
      !updateRecipeDTO.carbohydrates ||
      !updateRecipeDTO.fat
    )
      throw new BadRequestException(
        'Bạn phải nhập các chất dinh dưỡng được yêu cầu',
      );

    if (updateRecipeDTO.calories > 2500 || updateRecipeDTO.calories < 0)
      throw new BadRequestException('Lượng calo vượt quá ngưỡng cho phép!');

    if (updateRecipeDTO.protein > 80 || updateRecipeDTO.protein < 0)
      throw new BadRequestException('Lượng protein vượt quá ngưỡng cho phép!');

    if (updateRecipeDTO.fat > 70 || updateRecipeDTO.fat < 0)
      throw new BadRequestException('Lượng chất béo vượt quá ngưỡng cho phép!');
    if (
      updateRecipeDTO.carbohydrates > 100 ||
      updateRecipeDTO.carbohydrates < 0
    )
      throw new BadRequestException('Lượng calo vượt quá ngưỡng cho phép!');
    if (updateRecipeDTO.sodium > 1900 || updateRecipeDTO.sodium < 0)
      throw new BadRequestException('Lượng natri vượt quá ngưỡng cho phép!');

    if (updateRecipeDTO.fiber > 50 || updateRecipeDTO.fiber < 0)
      throw new BadRequestException('Lượng chất xơ vượt quá ngưỡng cho phép!');

    if (updateRecipeDTO.sugar > 50 || updateRecipeDTO.sugar < 0)
      throw new BadRequestException('Lượng đường vượt quá ngưỡng cho phép!');

    const calCalories =
      updateRecipeDTO.protein * CALORIES.PROTEIN +
      updateRecipeDTO.fat * CALORIES.FAT +
      updateRecipeDTO.carbohydrates * CALORIES.CARBS +
      updateRecipeDTO.fiber * CALORIES.FIBER +
      updateRecipeDTO.sugar * CALORIES.SUGAR;

    if (Math.abs(calCalories - updateRecipeDTO.calories) > 50)
      throw new BadRequestException(
        'The calories not math with the nutrition!',
      );

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
  ): Prisma.RecipeWhereInput {
    switch (searchBy) {
      case ERecipesSearchOption.TITLE:
        return {
          post: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        };
      case ERecipesSearchOption.AUTHOR:
        return {
          post: {
            author: {
              fullName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        };
      default:
        return {
          post: {
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
          },
        };
    }
  }

  private handleFilterCondition(
    getRecipeDTO: GetRecipeDTO,
  ): Prisma.RecipeWhereInput {
    const { categoryId, calories, protein, fat, carbs, sodium, fiber, sugar } =
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
      nutrition: {
        AND: [...andPostRecipeNutritionCondition],
      },
      recipeFoodCategory: categoryId
        ? {
            some: {
              foodCategoryId: categoryId,
            },
          }
        : {},
    };
  }

  public async reviewRecipe(
    userId: string,
    recipeId: number,
    data: ReviewRecipeDTO,
  ): Promise<TResponse<null>> {
    const { status, notificationId } = data;

    const recipe = await this.prismaService.recipe.findFirst({
      where: {
        id: recipeId,
      },
      include: {
        post: true,
      },
    });

    if (!recipe) throw new BadRequestException('Recipe does not exist!');

    await this.prismaService.post.update({
      where: {
        id: recipe.post.id,
      },
      data: {
        status:
          status === EReviewRecipeStatus.APPROVE
            ? PostStatus.ACCEPTED
            : PostStatus.REJECTED,
        reviewerId: userId,
      },
    });

    const notificationOnPost =
      await this.prismaService.notificationOnPost.findFirst({
        where: {
          postNotificationId: notificationId,
        },
      });

    await this.prismaService.notificationOnPost.update({
      where: {
        id: notificationOnPost.id,
      },
      data: {
        reviewerId: userId,
      },
    });

    return {
      data: null,
      message: 'Update recipe successfully!',
      status: HttpStatus.OK,
    };
  }

  public async deleteRecipe(id: number): Promise<TResponse<null>> {
    const recipe = await this.prismaService.recipe.findFirst({
      where: {
        id: id,
      },
      include: {
        post: true,
      },
    });

    if (!recipe)
      throw new BadRequestException(
        'Recipe does not exist or user is not owned of recipe!',
      );

    await this.prismaService.$transaction(async (tx) => {
      await tx.foodCategory.updateMany({
        where: {
          recipeFoodCategory: {
            some: {
              recipeId: recipe.id,
            },
          },
        },
        data: {
          numberOfRecipes: {
            decrement: 1,
          },
        },
      });

      const notificationOnPost = await tx.notificationOnPost.findMany({
        where: {
          externalId: recipe.post.id,
        },
      });

      const postNotificationIds = notificationOnPost.map(
        (noti) => noti.postNotificationId,
      );

      await tx.notificationOnPost.deleteMany({
        where: {
          externalId: recipe.post.id,
        },
      });

      await tx.postNotification.deleteMany({
        where: {
          id: {
            in: postNotificationIds,
          },
        },
      });

      const mealPlanRecipe = await tx.mealPlanRecipe.findMany({
        where: {
          recipeId: id,
        },
      });

      const mealPlanIds = mealPlanRecipe.map((m) => m.mealPlanId);

      await tx.mealPlanRecipe.deleteMany({
        where: {
          recipeId: id,
        },
      });

      await tx.mealPlanComment.deleteMany({
        where: {
          mealPlanId: {
            in: mealPlanIds,
          },
        },
      });

      await tx.mealPlan.deleteMany({
        where: {
          id: {
            in: mealPlanIds,
          },
        },
      });

      await tx.ingredient.deleteMany({
        where: {
          recipeId: id,
        },
      });

      await tx.mealPlanRecipe.deleteMany({
        where: {
          recipeId: id,
        },
      });

      await tx.recipeFoodCategory.deleteMany({
        where: {
          recipeId: id,
        },
      });

      await tx.nutrition.delete({
        where: {
          recipeId: id,
        },
      });

      await tx.recipe.delete({
        where: {
          id: id,
        },
      });

      await tx.postCategory.deleteMany({
        where: {
          postId: recipe.post.id,
        },
      });

      await tx.notificationOnPost.deleteMany({
        where: {
          externalId: recipe.post.id,
        },
      });

      await tx.comment.deleteMany({
        where: {
          postId: recipe.post.id,
        },
      });

      await tx.post.delete({
        where: {
          id: recipe.post.id,
        },
      });
    });

    return {
      data: null,
      message: 'Delete recipe successfully!',
      status: HttpStatus.OK,
    };
  }
}
