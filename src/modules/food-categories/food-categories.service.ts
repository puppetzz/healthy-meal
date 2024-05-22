import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../common/constants/general';
import { Database } from '../../types/drizzle-database/drizzle-database.type';

@Injectable()
export class FoodCategoriesService {
  constructor(
    @Inject(DRIZZLE_PROVIDER)
    private readonly db: Database,
  ) {}

  public async getFoodCategories() {
    const categories = await this.db.query.foodCategories.findMany({
      columns: {
        id: true,
        key: true,
        name: true,
        icon: true,
        numberOfRecipes: true,
      },
    });

    return {
      data: categories,
      message: 'Food categories fetched successfully!',
      status: HttpStatus.OK,
    };
  }
}
