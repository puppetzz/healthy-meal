import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { AuthUser } from '../../decorators/auth.decorator';
import { CreateMealPlanDTO } from '../../common/dto/meal-plan/create-meal-plan.dto';
import { UpdateMealPlanDTO } from '../../common/dto/meal-plan/update-meal-plan.dto';

@Controller('meal-plans')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  public async getMealPlans(@Query() paginationDTO: PaginationDTO) {
    return this.mealPlanService.getMealPlans(paginationDTO);
  }

  @Get(':id')
  public async getMealPlanById(@Param('id') id: number) {
    return this.mealPlanService.getMealPlanById(Number(id));
  }

  @Post()
  @UseGuards(FirebaseGuard)
  public async createMealPlan(
    @AuthUser('uid') userId: string,
    @Body() data: CreateMealPlanDTO,
  ) {
    return this.mealPlanService.createMealPlan(userId, data);
  }

  @Get('/my-meal-plans/all')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(FirebaseGuard)
  public async getMealPlansByUser(
    @AuthUser('uid') userId: string,
    @Query() paginationDTO: PaginationDTO,
  ) {
    return this.mealPlanService.getMealPlansByUser(userId, paginationDTO);
  }

  @Put()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(FirebaseGuard)
  public async updateMealPlan(
    @AuthUser('uid') userId: string,
    @Body() data: UpdateMealPlanDTO,
  ) {
    return this.mealPlanService.updateMealPlan(userId, data);
  }
}
