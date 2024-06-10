import { IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from '../pagination.dto';
import { EMealPlanSearchOption } from '../../enums/MealPlanSearchOption';

export class TGetMealPlanDTO extends PaginationDTO {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  searchBy: EMealPlanSearchOption;
}
