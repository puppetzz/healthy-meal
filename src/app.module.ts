import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecipeModule } from './modules/recipes/recipe.module';
import { FoodCategoriesModule } from './modules/food-categories/food-categories.module';

@Module({
  imports: [AuthModule, UsersModule, RecipeModule, FoodCategoriesModule],
})
export class AppModule {}
