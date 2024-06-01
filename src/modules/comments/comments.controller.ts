import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { AuthUser } from '../../decorators/auth.decorator';
import { CreateCommentDTO } from '../../common/dto/comments/create-comment.dto';

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
    @Body() createCommentDTO: CreateCommentDTO,
  ) {
    return this.commentsService.createComment(userId, createCommentDTO);
  }
}
