import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { TResponse } from '../../types/response-type';
import { Comment } from '@prisma/client';
import { CreateCommentDTO } from '../../common/dto/comments/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getCommentsByPostId(
    postId: number,
  ): Promise<TResponse<Comment[]>> {
    const comments = await this.prismaService.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      include: {
        author: true,
        comment: {
          include: {
            author: true,
          },
        },
      },
    });

    return {
      data: comments,
      message: 'Comments fetched successfully!',
      status: HttpStatus.OK,
    };
  }

  public async getCommentById(id: number): Promise<TResponse<Comment>> {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id: id,
      },
      include: {
        author: true,
        comment: true,
      },
    });

    return {
      data: comment,
      message: 'Comment fetched successfully!',
      status: HttpStatus.OK,
    };
  }

  public async createComment(
    userId: string,
    createCommentDTO: CreateCommentDTO,
  ): Promise<TResponse<Comment>> {
    const comment = await this.prismaService.comment.create({
      data: {
        authorId: userId,
        postId: createCommentDTO.postId,
        parentId: createCommentDTO.parentId,
        content: createCommentDTO.content,
        rating: createCommentDTO.rating ? createCommentDTO.rating : null,
      },
    });

    const post = await this.prismaService.post.findFirst({
      where: {
        id: createCommentDTO.postId,
      },
    });

    let rating = post.rating;

    if (createCommentDTO.rating) {
      if (rating && !!post.numberOfReviews) {
        rating =
          (rating * post.numberOfReviews + createCommentDTO.rating) /
          (post.numberOfReviews + 1);
      }
      if (!rating) {
        rating = createCommentDTO.rating;
      }
    }

    await this.prismaService.post.update({
      where: {
        id: createCommentDTO.postId,
      },
      data: {
        rating,
        numberOfComments: {
          increment: 1,
        },
        numberOfReviews: createCommentDTO.rating
          ? {
              increment: 1,
            }
          : undefined,
      },
    });

    return {
      data: comment,
      message: 'Comment created successfully!',
      status: HttpStatus.CREATED,
    };
  }
}
