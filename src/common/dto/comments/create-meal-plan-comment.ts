import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMealPlanCommentDTO {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  mealPlanId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating: number;
}
