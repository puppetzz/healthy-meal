import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { S3Service } from '../../services/s3/s3.service';
import { KyselyModule } from '../../database/kysely/kysely.module';
import { PrismaService } from '../../services/database/prisma.service';
import { EventsModule } from '../gateway/events.module';

@Module({
  imports: [KyselyModule, EventsModule],
  controllers: [RecipeController],
  providers: [RecipeService, S3Service, PrismaService],
})
export class RecipeModule {}
