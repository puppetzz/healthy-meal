import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prismaService: PrismaService) {}

  public async createPost() {}
}
