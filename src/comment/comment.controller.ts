import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './comment.interface';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import { CommentListFiltersDto } from './dtos/comment-list-filter.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  getAll(@Query() filter: CommentListFiltersDto): Comment[] {
    return this.commentService.getAll(filter);
  }

  @Post()
  create(@Body() createCommentDto: CreateCommentDto): Comment {
    return this.commentService.create(createCommentDto);
  }

  @Get(':id')
  getById(@Param() { id }: IdParamDto): Comment {
    return this.commentService.getById(id);
  }

  @Put(':id')
  update(
    @Param() { id }: IdParamDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Comment {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() { id }: IdParamDto) {
    return this.commentService.delete(id);
  }
}
