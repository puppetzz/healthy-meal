import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { TResponse } from '../../types/response-type';
import { Category, FoodCategory } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getFoodCategories(): Promise<TResponse<FoodCategory[]>> {
    const foodCategories = await this.prismaService.foodCategory.findMany();

    return {
      status: HttpStatus.OK,
      data: foodCategories,
      message: 'Food categories fetched successfully!',
    };
  }

  public async getPostCategories(): Promise<TResponse<Category[]>> {
    const postCategories = await this.prismaService.category.findMany();

    return {
      status: HttpStatus.OK,
      data: postCategories,
      message: 'Post categories fetched successfully!',
    };
  }
}
