import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MealPlanManagementService } from './meal-plan-management.service';
import { GetMealPlanDTO } from '../../../common/dto/meal-plan/get-meal-plans';

@Controller('/admin/meal-plans')
export class MealPlanManagementController {
  constructor(
    private readonly mealPlanManagementService: MealPlanManagementService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  public async getMealPlans(@Query() query: GetMealPlanDTO) {
    return this.mealPlanManagementService.getMealPlans(query);
  }

  @Get(':id')
  public async getMealPlanById(@Param('id') id: number) {
    return this.mealPlanManagementService.getMealPlanById(Number(id));
  }
}
