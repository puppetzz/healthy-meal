import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { EReviewRecipeStatus } from '../../enums/review-recipe-status.enum';
import { Type } from 'class-transformer';

export class ReviewRecipeDTO {
  @IsNotEmpty()
  @IsString()
  status: EReviewRecipeStatus;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  notificationId: number;
}
