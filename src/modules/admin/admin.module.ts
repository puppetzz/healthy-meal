import { Module } from '@nestjs/common';
import { UserManagementModule } from './user-managemnet/user-management.module';
import { RecipesManagementModule } from './recipes-management/recipes-management.module';
import { MealPlanManagementModule } from './meal-plan-management/meal-plan-management.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    UserManagementModule,
    RecipesManagementModule,
    MealPlanManagementModule,
    NotificationsModule,
  ],
})
export class AdminModule {}
