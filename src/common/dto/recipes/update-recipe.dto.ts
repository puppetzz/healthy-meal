import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRecipeDTO {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsNotEmpty()
  @IsString()
  thumbnail: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  prepTime: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  cookTime: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  servings: number;

  @IsNotEmpty()
  @IsString()
  calculationUnit: string;

  keeping: string;

  freezer: string;

  @IsOptional()
  @IsArray()
  ingredients: Ingredients[];

  @IsNotEmpty()
  @IsArray()
  foodCategoryIds: number[];

  @IsNotEmpty()
  calories: number;

  @IsNotEmpty()
  protein: number;

  @IsNotEmpty()
  carbohydrates: number;

  @IsNotEmpty()
  fat: number;

  @IsOptional()
  saturatedFat: number;

  @IsOptional()
  polyunsaturatedFat: number;

  @IsOptional()
  monounsaturatedFat: number;

  @IsOptional()
  transFat: number;

  @IsOptional()
  cholesterol: number;

  @IsOptional()
  sodium: number;

  @IsOptional()
  potassium: number;

  @IsOptional()
  fiber: number;

  @IsOptional()
  sugar: number;

  @IsOptional()
  vitaminA: number;

  @IsOptional()
  vitaminC: number;

  @IsOptional()
  calcium: number;

  @IsOptional()
  iron: number;
}

export class Ingredients {
  name: string;
  description: string;
  amount: number;
  unit: string;
}
