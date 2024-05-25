import { IsNumber, IsOptional } from 'class-validator';
import { PaginationDTO } from '../pagination.dto';
import { Type } from 'class-transformer';

export class GetRecipeDTO extends PaginationDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId: number;
}
