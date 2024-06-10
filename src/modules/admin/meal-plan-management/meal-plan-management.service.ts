import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/database/prisma.service';
import { PaginationDTO } from '../../../common/dto/pagination.dto';
import { TResponse } from '../../../types/response-type';
import { TMealPlanPagination } from '../../../types/meal-plan-pagination.type';

@Injectable()
export class MealPlanManagementService {
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
}
