import { MealPlanFrequency } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MealPlanRecipeDTO } from './meal-plan-recipe.dto';
import { ECreateStatus } from '../../enums/create-status.enum';

export class CreateMealPlanDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsNotEmpty()
  status: ECreateStatus;

  @IsNotEmpty()
  @IsString()
  frequency: MealPlanFrequency;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  mealPerDay: number;

  mealPlanRecipes: MealPlanRecipeDTO[];
}
