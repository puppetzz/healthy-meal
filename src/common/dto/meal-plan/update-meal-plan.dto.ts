import { MealPlanFrequency } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MealPlanRecipeDTO } from './meal-plan-recipe.dto';

export class UpdateMealPlanDTO {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  content: string;

  @IsNotEmpty()
  @IsString()
  frequency: MealPlanFrequency;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  mealPerDay: number;

  mealPlanRecipes: MealPlanRecipeDTO[];
}
