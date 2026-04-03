import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './comment.interface';
import { ZodValidationPipe } from 'src/utils/zodValidation.pipe';
import {
  CreateCommentDto,
  createCommentSchema,
} from './dtos/createComment.dto';
import {
  UpdateCommentDto,
  updateCommentSchema,
} from './dtos/updateComment.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  getAll(
    @Query('articleId', ParseUUIDPipe)
    articleId: string,
  ): Comment[] {
    return this.commentService.getAll({ articleId });
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createCommentSchema))
    createCommentDto: CreateCommentDto,
  ): Comment {
    return this.commentService.create(createCommentDto);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Comment {
    return this.commentService.getById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateCommentSchema))
    updateCommentDto: UpdateCommentDto,
  ): Comment {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentService.delete(id);
  }
}
