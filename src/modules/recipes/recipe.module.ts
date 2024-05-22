import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { S3Service } from '../../services/s3/s3.service';

@Module({
  imports: [DrizzleModule],
  controllers: [RecipeController],
  providers: [RecipeService, S3Service],
})
export class RecipeModule {}
