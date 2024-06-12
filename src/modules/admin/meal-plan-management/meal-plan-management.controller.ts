import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MealPlanManagementService } from './meal-plan-management.service';
import { GetMealPlanDTO } from '../../../common/dto/meal-plan/get-meal-plans';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AuthUser } from '../../../decorators/auth.decorator';
import { CreateMealPlanDTO } from '../../../common/dto/meal-plan/create-meal-plan.dto';
import { UpdateMealPlanDTO } from '../../../common/dto/meal-plan/update-meal-plan.dto';

@Controller('/admin/meal-plans')
export class MealPlanManagementController {
  constructor(
    private readonly mealPlanManagementService: MealPlanManagementService,
  ) {}

  @Get()
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  public async getMealPlans(@Query() query: GetMealPlanDTO) {
    return this.mealPlanManagementService.getMealPlans(query);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  public async getMealPlanById(@Param('id') id: number) {
    return this.mealPlanManagementService.getMealPlanById(Number(id));
  }

  @Post()
  @UseGuards(AdminGuard)
  public async createMealPlan(
    @AuthUser('uid') userId: string,
    @Body() data: CreateMealPlanDTO,
  ) {
    return this.mealPlanManagementService.createMealPlan(userId, data);
  }

  @Put()
  @UseGuards(AdminGuard)
  public async updateMealPlan(
    @AuthUser('uid') userId: string,
    @Body() data: UpdateMealPlanDTO,
  ) {
    return this.mealPlanManagementService.updateMealPlan(userId, data);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  public async deleteMealPlan(@Param('id') id: number) {
    return this.mealPlanManagementService.deleteMealPlan(Number(id));
  }
}
