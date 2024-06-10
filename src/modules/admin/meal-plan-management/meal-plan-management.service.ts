import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/database/prisma.service';
import { TResponse } from '../../../types/response-type';
import { TMealPlanPagination } from '../../../types/meal-plan-pagination.type';
import { MealPlan, Prisma } from '@prisma/client';
import { GetMealPlanDTO } from '../../../common/dto/meal-plan/get-meal-plans';
import { EMealPlanSearchOption } from '../../../common/enums/MealPlanSearchOption';

@Injectable()
export class MealPlanManagementService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getMealPlans(
    getMealPlanDTO: GetMealPlanDTO,
  ): Promise<TResponse<TMealPlanPagination>> {
    const { page, pageSize, search, searchBy } = getMealPlanDTO;

    let skip = 0;
    let take = undefined;

    if (page && pageSize) {
      skip = (page - 1) * pageSize;
      take = pageSize;
    }

    const searchOption: Prisma.MealPlanWhereInput = this.handleSearchFilter(
      search,
      searchBy,
    );

    const mealPlans = await this.prismaService.mealPlan.findMany({
      where: {
        ...searchOption,
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
        ...searchOption,
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

  private handleSearchFilter(
    search: string,
    searchBy: string,
  ): Prisma.MealPlanWhereInput {
    switch (searchBy) {
      case EMealPlanSearchOption.TITLE:
        return {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        };
      case EMealPlanSearchOption.AUTHOR:
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
}
