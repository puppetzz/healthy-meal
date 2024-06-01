import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecipeModule } from './modules/recipes/recipe.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/config';
import { FilesModule } from './modules/files/files.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { MealPlanModule } from './modules/meal-plan/meal-plan.module';
import { HealthMetricsCalculatorModule } from './modules/health-metrics-calculator/health-metrics-calculator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AuthModule,
    UsersModule,
    RecipeModule,
    CategoriesModule,
    FilesModule,
    PostsModule,
    CommentsModule,
    MealPlanModule,
    HealthMetricsCalculatorModule,
  ],
})
export class AppModule {}
