import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { TResponse } from '../../types/response-type';
import {
  NotificationExternalTable,
  Nutrition,
  Post,
  PostStatus,
  Prisma,
  Recipe,
} from '@prisma/client';
import { GetRecipeDTO } from '../../common/dto/recipes/get-recipe.dto';
import { CreateRecipeDTO } from '../../common/dto/recipes/create-recipes.dto';
import { UpdateRecipeDTO } from '../../common/dto/recipes/update-recipe.dto';
import { TRecipePagination } from '../../types/recipe-pagination';
import { RecommendRecipesDTO } from '../../common/dto/recipes/recommend-recipes.dto';
import { TTargetNutrition } from '../../types/target-nutrition.type';
import { EMeal } from '../../common/enums/meal.enum';
import { CALORIES } from '../../common/constants/nutrition';
import { EventsGateway } from '../gateway/events.gateway';
import { ECreateStatus } from '../../common/enums/create-status.enum';

@Injectable()
export class RecipeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  public async getRecipes(
    getRecipeDTO: GetRecipeDTO,
  ): Promise<TResponse<TRecipePagination>> {
    const { page, pageSize, search } = getRecipeDTO;

    const skip = pageSize ? (page - 1) * pageSize : 0;

    const whereWithFilter = this.handleFilterCondition(getRecipeDTO);

    const recipes = await this.prismaService.recipe.findMany({
      where: {
        post: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
          status: PostStatus.ACCEPTED,
        },
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
        post: true,
      },
      skip,
      take: pageSize,
    });

    const numberOfRecipes = await this.prismaService.recipe.count({
      where: {
        post: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
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

  public async recommendRecipes(
    recommendRecipesDTO: RecommendRecipesDTO,
  ): Promise<TResponse<Recipe[]>> {
    const { search, calories, protein, fat, carbs, meal } = recommendRecipesDTO;

    const recipes = await this.prismaService.recipe.findMany({
      where: {
        post: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
      include: {
        recipeFoodCategory: {
          include: {
            foodCategory: true,
          },
        },
        nutrition: true,
        ingredient: true,
        post: true,
      },
    });

    recipes.sort(
      (a, b) =>
        this.calculateTargetDistance(a.nutrition, {
          calories,
          protein,
          fat,
          carbs,
        }) -
        this.calculateTargetDistance(b.nutrition, {
          calories,
          protein,
          fat,
          carbs,
        }),
    );

    const categoryItems: typeof recipes = [];
    const otherItems: typeof recipes = [];

    recipes.forEach((recipe) => {
      const categories = recipe.recipeFoodCategory.map(
        (data) => data.foodCategory.key,
      );

      const isInCaloriesRange =
        Math.abs(recipe.nutrition.calories - calories) < 100;

      switch (meal) {
        case EMeal.BREAKFAST:
          if (categories.includes(EMeal.BREAKFAST) && isInCaloriesRange) {
            categoryItems.push(recipe);
          } else {
            otherItems.push(recipe);
          }
          break;
        case EMeal.LUNCH:
          if (!categories.includes(EMeal.BREAKFAST) && isInCaloriesRange) {
            categoryItems.push(recipe);
          } else {
            otherItems.push(recipe);
          }
          break;
        case EMeal.DINNER:
          if (categories.includes(EMeal.DINNER) && isInCaloriesRange) {
            categoryItems.push(recipe);
          } else {
            otherItems.push(recipe);
          }
          break;
        case EMeal.SNACKS:
          if (categories.includes(EMeal.SNACKS) && isInCaloriesRange) {
            categoryItems.push(recipe);
          } else {
            otherItems.push(recipe);
          }
          break;
      }
    });

    const result = categoryItems.concat(otherItems);

    return {
      data: result,
      message: 'Fetch Data Successfully!',
      status: HttpStatus.OK,
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

    const post = await this.prismaService.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          prepTime: createRecipeDTO.prepTime,
          cookTime: createRecipeDTO.cookTime,
          servings: createRecipeDTO.servings,
          servingSize: createRecipeDTO.servingSize,
          keeping: createRecipeDTO.keeping,
          freezer: '',
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

      return await tx.post.create({
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

    if (createRecipeDTO.status == ECreateStatus.PUBLISH) {
      await this.eventsGateway.createAndPublishRecipes(userId, post);
      await this.prismaService.notification.create({
        data: {
          userId: userId,
          title: 'Chia Sẻ Công Thức',
          content: 'Yêu cầu chia sẻ công thức của bạn đang được phê duyệt!',
        },
      });
    }

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
        authorId: userId,
        id: updateRecipeDTO.id,
      },
      include: {
        recipe: true,
      },
    });

    if (!post) throw new BadRequestException('You are not the owner of recipe');

    const updatedStatus = this.getUpdateStatus(post.status);

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
          status: updatedStatus,
          reviewerId: null,
        },
      });

      if (updatedStatus === PostStatus.PENDING) {
        await this.eventsGateway.updateRecipes(userId, post);
        await this.prismaService.notification.create({
          data: {
            userId: userId,
            title: 'Cập nhật công thức',
            content: 'Yêu cầu cập nhật công thức của bạn đang được phê duyệt!',
          },
        });
      }
    });

    return {
      data: null,
      message: 'Update recipes successfully!',
      status: HttpStatus.OK,
    };
  }

  public getUpdateStatus(currentStatus: PostStatus): PostStatus {
    switch (currentStatus) {
      case PostStatus.ACCEPTED:
      case PostStatus.PENDING:
        return PostStatus.PENDING;
      case PostStatus.REJECTED:
        return PostStatus.REJECTED;
      default:
        return PostStatus.DRAFT;
    }
  }

  public async getRecipesByUserId(
    userId: string,
    getRecipeDTO: GetRecipeDTO,
  ): Promise<TResponse<TRecipePagination>> {
    const { page, pageSize, search } = getRecipeDTO;

    const skip = pageSize ? (page - 1) * pageSize : 0;

    const whereWithFilter = this.handleFilterCondition(getRecipeDTO);

    const recipes = await this.prismaService.recipe.findMany({
      where: {
        ...whereWithFilter,
        post: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
          authorId: userId,
        },
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
        ...whereWithFilter,
        post: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
          authorId: userId,
        },
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

  public async submitPublish(userId: string, id: number) {
    const post = await this.prismaService.post.findFirst({
      where: {
        id: id,
        authorId: userId,
      },
    });

    if (!post)
      throw new BadRequestException(
        'The post does not exist or you are not owner of the recipe!',
      );

    console.log(post.status);

    if (
      [PostStatus.ACCEPTED.toString(), PostStatus.PENDING.toString()].includes(
        post.status,
      )
    ) {
      throw new BadRequestException(
        'The recipe is being pending or has been approved!',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.post.update({
        where: {
          id: id,
        },
        data: {
          status: PostStatus.PENDING,
        },
      });
      const notification = await tx.postNotification.create({
        data: {
          title: 'Publish Recipe',
          content: 'User publish Recipe',
        },
      });

      await tx.notificationOnPost.create({
        data: {
          externalId: id,
          externalTable: NotificationExternalTable.POST,
          postNotificationId: notification.id,
        },
      });
    });
  }

  public async getLatestRecipe(): Promise<TResponse<Recipe>> {
    const recipe = await this.prismaService.recipe.findMany({
      where: {
        post: {
          status: PostStatus.ACCEPTED,
        },
      },
      orderBy: {
        post: {
          createdAt: 'desc',
        },
      },
      include: {
        post: true,
        recipeFoodCategory: {
          include: {
            foodCategory: true,
          },
        },
        nutrition: true,
      },
    });

    return {
      data: recipe[0],
      message: 'Get recipe successfully!',
      status: HttpStatus.OK,
    };
  }

  public async getRecipesRanking(): Promise<TResponse<Recipe[]>> {
    const recipes = await this.prismaService.recipe.findMany({
      include: {
        post: true,
        ingredient: true,
        recipeFoodCategory: {
          include: {
            foodCategory: true,
          },
        },
        nutrition: true,
      },
      orderBy: {
        post: {
          rating: 'desc',
        },
      },
    });

    return {
      data: recipes.slice(0, 5),
      message: 'Get recipes successfully!',
      status: HttpStatus.OK,
    };
  }

  public async deleteRecipe(
    userId: string,
    recipeId: number,
  ): Promise<TResponse<null>> {
    const recipe = await this.prismaService.recipe.findFirst({
      where: {
        id: recipeId,
        post: {
          authorId: userId,
        },
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
      await tx.ingredient.deleteMany({
        where: {
          recipeId: recipeId,
        },
      });

      await tx.mealPlanRecipe.deleteMany({
        where: {
          recipeId: recipeId,
        },
      });

      await tx.recipeFoodCategory.deleteMany({
        where: {
          recipeId: recipeId,
        },
      });

      await tx.nutrition.delete({
        where: {
          recipeId: recipeId,
        },
      });

      await tx.recipe.delete({
        where: {
          id: recipeId,
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

  private calculateTargetDistance(
    nutrition: Nutrition,
    targetNutrition: TTargetNutrition,
  ): number {
    return Math.sqrt(
      Math.pow(nutrition.calories - targetNutrition.calories, 2) +
        Math.pow(nutrition.protein - targetNutrition.protein, 2) +
        Math.pow(nutrition.fat - targetNutrition.fat, 2) +
        Math.pow(nutrition.carbohydrates - targetNutrition.carbs, 2),
    );
  }

  private getFoodCategories(
    recipeFoodCategory: Prisma.RecipeFoodCategoryGetPayload<{
      include: {
        foodCategory: true;
      };
    }>[],
  ) {
    return recipeFoodCategory.map((data) => data.foodCategory.key);
  }
}
