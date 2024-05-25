import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { ResponseType } from '../../types/response-type';
import { FoodCategory } from '@prisma/client';

@Injectable()
export class FoodCategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getFoodCategories(): Promise<ResponseType<FoodCategory[]>> {
    const foodCategories = await this.prismaService.foodCategory.findMany();

    return {
      status: HttpStatus.OK,
      data: foodCategories,
      message: 'Food categories fetched successfully!',
    };
  }
}
