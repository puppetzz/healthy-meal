import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { TResponse } from '../../types/response-type';
import { MealPlan, MealPlanStatus } from '@prisma/client';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { TMealPlanPagination } from '../../types/meal-plan-pagination.type';
import { CreateMealPlanDTO } from '../../common/dto/meal-plan/create-meal-plan.dto';
import { UpdateMealPlanDTO } from '../../common/dto/meal-plan/update-meal-plan.dto';
import { ECreateStatus } from '../../common/enums/create-status.enum';
import { EventsGateway } from '../gateway/events.gateway';

@Injectable()
export class MealPlanService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

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

    if (status !== ECreateStatus.DRAFT && status !== ECreateStatus.PUBLISH) {
      throw new BadRequestException('Invalid status');
    }

    const mealPlan = await this.prismaService.mealPlan.create({
      data: {
        title: title,
        content: content || '',
        status:
          status === ECreateStatus.PUBLISH
            ? MealPlanStatus.PENDING
            : MealPlanStatus.DRAFT,
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

    if (status === ECreateStatus.PUBLISH) {
      await this.eventsGateway.createPublishMealPlan(userId, mealPlan);
      await this.prismaService.notification.create({
        data: {
          userId: userId,
          title: 'Chia Sẻ Kế Hoạch Ăn Uống',
          content: 'Yêu cầu chia sẻ kế hoạch của bạn đang được phê duyệt!',
        },
      });
    }

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

  public async updateMealPlan(
    userId: string,
    updateMealPlanDTO: UpdateMealPlanDTO,
  ): Promise<TResponse<MealPlan>> {
    const { id, title, content, frequency, mealPerDay, mealPlanRecipes } =
      updateMealPlanDTO;

    const mealPlan = await this.prismaService.mealPlan.findFirst({
      where: {
        id: id,
        authorId: userId,
      },
    });

    if (!mealPlan)
      throw new BadRequestException(
        'Meal plan does not exist or you are not owner of meal plan!',
      );

    const updatedStatus = this.getUpdateStatus(mealPlan.status);

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
            status: updatedStatus,
          },
        });
      },
    );

    if (updatedStatus === MealPlanStatus.PENDING) {
      await this.eventsGateway.updatePublishMealPlan(userId, updatedMealPlan);
      await this.prismaService.notification.create({
        data: {
          userId: userId,
          title: 'Cập Nhật Kế Hoạch Ăn Uống',
          content: 'Yêu cầu cập nhật kế hoạch của bạn đang được phê duyệt!',
        },
      });
    }

    return {
      data: updatedMealPlan,
      message: 'Update meal plan successfully!',
      status: HttpStatus.OK,
    };
  }

  public getUpdateStatus(currentStatus: MealPlanStatus): MealPlanStatus {
    switch (currentStatus) {
      case MealPlanStatus.PUBLISHED:
      case MealPlanStatus.PENDING:
        return MealPlanStatus.PENDING;
      case MealPlanStatus.REJECTED:
        return MealPlanStatus.REJECTED;
      default:
        return MealPlanStatus.DRAFT;
    }
  }
}
