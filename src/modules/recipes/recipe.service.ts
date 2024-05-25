import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { ResponseType } from '../../types/response-type';
import { Prisma } from '@prisma/client';
import { GetRecipeDTO } from '../../common/dto/recipes/get-recipe.dto';
import { PostPagination } from '../../types/post-pagination.type';

@Injectable()
export class RecipeService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getRecipes(
    GetRecipeDTO: GetRecipeDTO,
  ): Promise<ResponseType<PostPagination>> {
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
}
