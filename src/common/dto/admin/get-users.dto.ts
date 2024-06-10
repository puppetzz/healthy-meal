import { IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from '../pagination.dto';

export class GetUsersDTO extends PaginationDTO {
  @IsOptional()
  @IsString()
  search: string;
}
