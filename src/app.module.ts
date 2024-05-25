import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecipeModule } from './modules/recipes/recipe.module';
import { FoodCategoriesModule } from './modules/food-categories/food-categories.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AuthModule,
    UsersModule,
    RecipeModule,
    FoodCategoriesModule,
  ],
})
export class AppModule {}
