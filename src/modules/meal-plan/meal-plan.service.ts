import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { TResponse } from '../../types/response-type';
import { MealPlan, MealPlanStatus } from '@prisma/client';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { TMealPlanPagination } from '../../types/meal-plan-pagination.type';
import { CreateMealPlanDTO } from '../../common/dto/meal-plan/createMealPlan.dto';

@Injectable()
export class MealPlanService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getMealPlans(
    paginationDTO: PaginationDTO,
  ): Promise<TResponse<TMealPlanPagination>> {
    const { page, pageSize } = paginationDTO;

    let skip = 0;
    let take = undefined;

    if (page && pageSize) {
      skip = (page - 1) * pageSize;
      take = pageSize;
    }

    const mealPlans = await this.prismaService.mealPlan.findMany({
      include: {
        mealPlanRecipe: {
          include: {
            recipe: {
              include: {
                post: true,
              },
            },
          },
        },
        author: true,
      },
      skip,
      take,
    });

    const numberOfMealPlans = await this.prismaService.mealPlan.count();

    const totalPage = Math.ceil(numberOfMealPlans / pageSize);

    return {
      data: {
        data: mealPlans,
        page,
        total: totalPage,
      },
      message: 'Meal plan fetched successfully!',
      status: 200,
    };
  }

  public async getMealPlanById(id: number): Promise<TResponse<MealPlan>> {
    const mealPlan = await this.prismaService.mealPlan.findFirst({
      where: {
        id,
      },
      include: {
        mealPlanRecipe: {
          include: {
            recipe: {
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
            },
          },
        },
        author: true,
      },
    });

    if (!mealPlan) {
      throw new Error('Meal plan not found');
    }

    mealPlan.mealPlanRecipe = mealPlan.mealPlanRecipe.sort(
      (a, b) => a.day - b.day,
    );

    return {
      data: mealPlan,
      message: 'Meal plan fetched successfully!',
      status: 200,
    };
  }

  public async createMealPlan(
    userId: string,
    createMealPlanDTO: CreateMealPlanDTO,
  ): Promise<TResponse<MealPlan>> {
    const { title, content, status, frequency, mealPlanRecipes, mealPerDay } =
      createMealPlanDTO;

    if (status !== MealPlanStatus.DRAFT && status !== MealPlanStatus.PENDING) {
      throw new Error('Invalid meal plan status');
    }

    const mealPlan = await this.prismaService.mealPlan.create({
      data: {
        title: title,
        content: content || '',
        status: status,
        frequency: frequency,
        authorId: userId,
        mealPerDay: mealPerDay,
        mealPlanRecipe: {
          create: mealPlanRecipes.map((mealPlanRecipe) => {
            return {
              recipeId: mealPlanRecipe.recipeId,
              day: mealPlanRecipe.day,
              meal: mealPlanRecipe.meal,
            };
          }),
        },
      },
    });

    return {
      data: mealPlan,
      message: 'Meal plan created successfully!',
      status: HttpStatus.CREATED,
    };
  }

  public async getMealPlansByUser(
    userId: string,
    paginationDTO: PaginationDTO,
  ): Promise<TResponse<TMealPlanPagination>> {
    const { page, pageSize } = paginationDTO;

    let skip = 0;
    let take = undefined;

    if (page && pageSize) {
      skip = (page - 1) * pageSize;
      take = pageSize;
    }

    const mealPlans = await this.prismaService.mealPlan.findMany({
      where: {
        authorId: userId,
      },
      include: {
        mealPlanRecipe: {
          include: {
            recipe: {
              include: {
                post: true,
              },
            },
          },
        },
        author: true,
      },
      skip,
      take,
    });

    const numberOfMealPlans = await this.prismaService.mealPlan.count({
      where: {
        authorId: userId,
      },
    });

    const totalPage = Math.ceil(numberOfMealPlans / pageSize);

    return {
      data: {
        data: mealPlans,
        page,
        total: totalPage,
      },
      message: 'Meal plan fetched successfully!',
      status: 200,
    };
  }
}
