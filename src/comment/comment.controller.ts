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
import { CreateCommentDto } from './dtos/createComment.dto';
import { UpdateCommentDto } from './dtos/updateComment.dto';

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
  create(@Body() createCommentDto: CreateCommentDto): Comment {
    return this.commentService.create(createCommentDto);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Comment {
    return this.commentService.getById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Comment {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentService.delete(id);
  }
}
