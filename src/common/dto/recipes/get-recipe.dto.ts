import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from '../pagination.dto';
import { Type } from 'class-transformer';
import { ERecipesSearchOption } from '../../enums/recipes-search-option';

export class GetRecipeDTO extends PaginationDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  searchBy: ERecipesSearchOption;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  calories?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  protein?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  fat?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  carbs?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  sodium?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  fiber?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  sugar?: number[];
}
