import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EMeal } from '../../enums/meal.enum';

export class RecommendRecipesDTO {
  @IsOptional()
  @IsString()
  search: string;

  @IsNotEmpty()
  @IsString()
  meal: EMeal;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  calories: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  protein: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  fat: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  carbs: number;
}
