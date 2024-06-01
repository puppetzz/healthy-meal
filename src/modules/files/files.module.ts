import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { S3Service } from '../../services/s3/s3.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, S3Service],
})
export class FilesModule {}
