import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3_PRESIGNED_URL_EXPIRATION } from '../../common/constants/general';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  public async createPutObjectSigner(
    key: string,
    ContentType: string,
  ): Promise<string> {
    const putObjectCommand = new PutObjectCommand({
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      Key: key,
      ContentType,
    });

    return await getSignedUrl(this.s3Client, putObjectCommand, {
      expiresIn: S3_PRESIGNED_URL_EXPIRATION,
    });
  }

  public async createGetObjectSigner(key: string): Promise<string> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      Key: `${key}`,
    });

    return await getSignedUrl(this.s3Client, getObjectCommand, {
      expiresIn: S3_PRESIGNED_URL_EXPIRATION,
    });
  }
}
