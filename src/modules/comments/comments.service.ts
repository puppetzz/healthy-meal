import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/database/prisma.service';
import { TResponse } from '../../types/response-type';
import { Comment, MealPlanComment } from '@prisma/client';
import { CreatePostCommentDTO } from '../../common/dto/comments/create-post-comment.dto';
import { CreateMealPlanCommentDTO } from '../../common/dto/comments/create-meal-plan-comment';

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

  public async createPostComment(
    userId: string,
    createPostCommentDTO: CreatePostCommentDTO,
  ): Promise<TResponse<Comment>> {
    const comment = await this.prismaService.comment.create({
      data: {
        authorId: userId,
        postId: createPostCommentDTO.postId,
        parentId: createPostCommentDTO.parentId,
        content: createPostCommentDTO.content,
        rating: createPostCommentDTO.rating
          ? createPostCommentDTO.rating
          : null,
      },
    });

    const post = await this.prismaService.post.findFirst({
      where: {
        id: createPostCommentDTO.postId,
      },
    });

    let rating = post.rating;

    if (createPostCommentDTO.rating) {
      if (rating && !!post.numberOfReviews) {
        rating =
          (rating * post.numberOfReviews + createPostCommentDTO.rating) /
          (post.numberOfReviews + 1);
      }
      if (!rating) {
        rating = createPostCommentDTO.rating;
      }
    }

    await this.prismaService.post.update({
      where: {
        id: createPostCommentDTO.postId,
      },
      data: {
        rating,
        numberOfComments: {
          increment: 1,
        },
        numberOfReviews: createPostCommentDTO.rating
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

  public async getMealPlanComment(
    id: number,
  ): Promise<TResponse<MealPlanComment[]>> {
    const comment = await this.prismaService.mealPlanComment.findMany({
      where: {
        mealPlanId: id,
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
      data: comment,
      message: 'Comments fetched successfully!',
      status: HttpStatus.OK,
    };
  }

  public async createMealPlanComment(
    userId: string,
    createMealPlanCommentDTO: CreateMealPlanCommentDTO,
  ): Promise<TResponse<MealPlanComment>> {
    const comment = await this.prismaService.mealPlanComment.create({
      data: {
        authorId: userId,
        mealPlanId: createMealPlanCommentDTO.mealPlanId,
        parentId: createMealPlanCommentDTO.parentId,
        content: createMealPlanCommentDTO.content,
        rating: createMealPlanCommentDTO.rating
          ? createMealPlanCommentDTO.rating
          : null,
      },
    });

    const post = await this.prismaService.mealPlan.findFirst({
      where: {
        id: createMealPlanCommentDTO.mealPlanId,
      },
    });

    let rating = post.rating;

    if (createMealPlanCommentDTO.rating) {
      if (rating && !!post.numberOfReviews) {
        rating =
          (rating * post.numberOfReviews + createMealPlanCommentDTO.rating) /
          (post.numberOfReviews + 1);
      }
      if (!rating) {
        rating = createMealPlanCommentDTO.rating;
      }
    }

    await this.prismaService.mealPlan.update({
      where: {
        id: createMealPlanCommentDTO.mealPlanId,
      },
      data: {
        rating,
        numberOfComments: {
          increment: 1,
        },
        numberOfReviews: createMealPlanCommentDTO.rating
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
