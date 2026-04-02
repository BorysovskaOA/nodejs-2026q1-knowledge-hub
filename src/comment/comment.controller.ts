import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ArticleService } from 'src/article/article.service';
import { UserService } from 'src/user/user.service';
import { Comment } from './interfaces/comment.interface';
import { ZodValidationPipe } from 'src/utils/zodValidation.pipe';
import {
  CreateCommentDto,
  createCommentSchema,
} from './dtos/createComment.dto';
import {
  UpdateCommentDto,
  updateCommentSchema,
} from './dtos/updateComment.dto';

@Controller('commnet')
export class CommentController {
  constructor(
    private commentService: CommentService,
    private articleService: ArticleService,
    private userService: UserService,
  ) {}

  @Get()
  getAll(@Query('articleId', ParseUUIDPipe) articleId: string): Comment[] {
    return this.commentService.getAll({ articleId });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createCommentSchema))
  create(@Body() createCommentDto: CreateCommentDto): Comment {
    const createdAt = Date.now();

    const article = this.articleService.getById(createCommentDto.articleId);

    if (!article) {
      throw new BadRequestException();
    }

    const author = this.userService.getById(createCommentDto.authorId);

    if (!author) {
      throw new BadRequestException();
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      ...createCommentDto,
      createdAt,
    };

    this.commentService.create(comment);

    return comment;
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Comment {
    const comment = this.commentService.getById(id);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updateCommentSchema))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Comment {
    const comment = this.commentService.getById(id);

    if (!comment) {
      throw new NotFoundException();
    }

    const updatedComment: Comment = {
      ...comment,
      ...updateCommentDto,
    };

    this.commentService.update(id, updatedComment);

    return updatedComment;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    const comment = this.commentService.getById(id);

    if (!comment) {
      throw new NotFoundException();
    }

    this.commentService.delete(id);
  }
}
