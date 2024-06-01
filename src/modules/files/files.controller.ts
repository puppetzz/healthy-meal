import { Body, Controller, Post } from '@nestjs/common';
import { S3Service } from '../../services/s3/s3.service';
import { UploadFileDto } from '../../common/dto/files/upload-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  public async createUploadFileSignerUrl(@Body() uploadFileDto: UploadFileDto) {
    const { key, contentType } = uploadFileDto;
    return await this.s3Service.createPutObjectSigner(key, contentType);
  }
}
