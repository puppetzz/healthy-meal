import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { isNotNull } from 'drizzle-orm';
import { Database } from '../../types/drizzle-database/drizzle-database.type';
import { DRIZZLE_PROVIDER } from '../../common/constants/general';
import { posts } from '../../schema';
import { S3Service } from '../../services/s3/s3.service';
import { ResponseType } from '../../types/response-type';
import { Post } from '../../types/schema/post.type';

@Injectable()
export class RecipeService {
  constructor(
    @Inject(DRIZZLE_PROVIDER)
    private readonly db: Database,
    private readonly s3Service: S3Service,
  ) {}

  public async getRecipes(): Promise<ResponseType<Post[]>> {
    const recipe = await this.db.query.posts.findMany({
      where: isNotNull(posts.recipeId),
      with: {
        recipe: {
          with: {
            nutrition: true,
            recipeFoodCategory: {
              with: {
                foodCategory: true,
              },
              columns: {
                foodCategoryId: false,
                recipeId: false,
              },
            },
          },
        },
      },
    });

    return {
      data: recipe,
      message: 'Recipes fetched successfully',
      status: HttpStatus.OK,
    };
  }
}
