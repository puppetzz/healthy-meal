import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { PaginationDTO } from '../../common/dto/pagination.dto';

@Controller('meal-plans')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  public async getMealPlans(@Query() paginationDTO: PaginationDTO) {
    return this.mealPlanService.getMealPlans(paginationDTO);
  }
}
