import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

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
