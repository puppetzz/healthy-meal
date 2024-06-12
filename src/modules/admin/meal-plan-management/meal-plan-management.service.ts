import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/database/prisma.service';
import { TResponse } from '../../../types/response-type';
import { TMealPlanPagination } from '../../../types/meal-plan-pagination.type';
import { MealPlan, MealPlanStatus, Prisma } from '@prisma/client';
import { GetMealPlanDTO } from '../../../common/dto/meal-plan/get-meal-plans';
import { EMealPlanSearchOption } from '../../../common/enums/MealPlanSearchOption';
import { CreateMealPlanDTO } from '../../../common/dto/meal-plan/create-meal-plan.dto';
import { UpdateMealPlanDTO } from '../../../common/dto/meal-plan/update-meal-plan.dto';

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
          orderBy: {
            day: 'asc',
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

  public async deleteMealPlan(id: number): Promise<TResponse<null>> {
    const mealPlan = await this.prismaService.mealPlan.findFirst({
      where: {
        id: id,
      },
    });

    if (!mealPlan) throw new BadRequestException('Meal Plan Does Not Exist!');

    await this.prismaService.$transaction(async (tx) => {
      await tx.mealPlanComment.deleteMany({
        where: {
          mealPlanId: id,
        },
      });

      await tx.mealPlanRecipe.deleteMany({
        where: {
          mealPlanId: id,
        },
      });

      await tx.mealPlan.delete({
        where: {
          id: id,
        },
      });
    });

    return {
      data: null,
      message: 'Delete Meal Plan Successfully!',
      status: HttpStatus.OK,
    };
  }

  public async updateMealPlan(
    userId: string,
    updateMealPlanDTO: UpdateMealPlanDTO,
  ): Promise<TResponse<MealPlan>> {
    const { id, title, content, frequency, mealPerDay, mealPlanRecipes } =
      updateMealPlanDTO;

    const mealPlan = this.prismaService.mealPlan.findFirst({
      where: {
        id: id,
      },
    });

    if (!mealPlan)
      throw new BadRequestException('The meal plan does not exist!');

    const updatedMealPlan = await this.prismaService.$transaction(
      async (tx) => {
        await tx.mealPlanRecipe.deleteMany({
          where: {
            mealPlanId: id,
          },
        });

        await tx.mealPlanRecipe.createMany({
          data: mealPlanRecipes.map((mealPlanRecipe) => ({
            mealPlanId: id,
            recipeId: mealPlanRecipe.recipeId,
            day: mealPlanRecipe.day,
            meal: mealPlanRecipe.meal,
          })),
        });

        return await tx.mealPlan.update({
          where: {
            id: id,
          },
          data: {
            title: title,
            content: content,
            frequency: frequency,
            mealPerDay: mealPerDay,
          },
        });
      },
    );

    return {
      data: updatedMealPlan,
      message: 'Update Meal Plan Successfully',
      status: HttpStatus.OK,
    };
  }
}
