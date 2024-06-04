import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { AuthUser } from '../../decorators/auth.decorator';
import { CreatePostCommentDTO } from '../../common/dto/comments/create-post-comment.dto';
import { CreateMealPlanCommentDTO } from '../../common/dto/comments/create-meal-plan-comment';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('post/:postId')
  public async getCommentsByPostId(@Param('postId') postId: number) {
    const id = Number(postId);
    return this.commentsService.getCommentsByPostId(id);
  }

  @Get(':id')
  public async getCommentById(@Param('id') id: number) {
    return this.commentsService.getCommentById(id);
  }

  @Post()
  @UseGuards(FirebaseGuard)
  public async createComment(
    @AuthUser('uid') userId: string,
    @Body() createCommentDTO: CreatePostCommentDTO,
  ) {
    return this.commentsService.createPostComment(userId, createCommentDTO);
  }

  @Get('meal-plan/:id')
  public async getMealPlanComment(@Param('id') id: number) {
    return this.commentsService.getMealPlanComment(Number(id));
  }

  @Post('meal-plan')
  @UseGuards(FirebaseGuard)
  public async createMealPlanComment(
    @AuthUser('uid') userId: string,
    @Body() createMealPlanCommentDTO: CreateMealPlanCommentDTO,
  ) {
    return this.commentsService.createMealPlanComment(
      userId,
      createMealPlanCommentDTO,
    );
  }
}
