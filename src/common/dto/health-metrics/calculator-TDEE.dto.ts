import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityLevel } from '../../enums/activity-level.enum';
import { Gender } from '@prisma/client';

export class TDEECalculatorDTO {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  weight: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  height: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  age: number;

  @IsNotEmpty()
  @IsString()
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  activityLevel: keyof typeof ActivityLevel;
}
