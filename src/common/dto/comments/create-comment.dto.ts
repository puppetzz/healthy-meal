import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDTO {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  postId: number;

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
