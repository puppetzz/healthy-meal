import { MealPlanFrequency } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMealPlanDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  content: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  @IsString()
  frequency: MealPlanFrequency;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  mealPerDay: number;

  mealPlanRecipes: MealPlanRecipeDTO[];
}

export class MealPlanRecipeDTO {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  recipeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  day: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  meal: number;
}
