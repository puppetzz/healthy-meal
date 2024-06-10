import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MealPlanManagementService } from './meal-plan-management.service';
import { PaginationDTO } from '../../../common/dto/pagination.dto';

@Controller('/admin/meal-plans')
export class MealPlanManagementController {
  constructor(
    private readonly mealPlanManagementService: MealPlanManagementService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  public async getMealPlans(@Query() paginationDTO: PaginationDTO) {
    return this.mealPlanManagementService.getMealPlans(paginationDTO);
  }
}
