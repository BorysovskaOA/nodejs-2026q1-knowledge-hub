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
import { CreateCommentDto } from './models/create-comment.dto';
import { UpdateCommentDto } from './models/update-comment.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import {
  CommentListFiltersDto,
  CommentListFiltersPaginatedDto,
} from './models/comment-list-filter.dto';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { ApiPaginatedResponse } from 'src/core/decorators/api-paginated-response.decorator';
import { CommentEntity } from './models/comment.entity';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UnprocessableEntityResponseDto } from 'src/core/dtos/unprocessable-entity-response.dto';
import { ValidationResponseDto } from 'src/core/dtos/validation-response.dto';

@Controller('comment')
@ApiBadRequestResponse({ type: ValidationResponseDto })
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  @ApiOkResponse({ type: [CommentEntity] })
  getAll(@Query() filter: CommentListFiltersDto): CommentEntity[] {
    return this.commentService.getAll(filter);
  }

  @Get('paginated')
  @ApiPaginatedResponse(CommentEntity)
  getAllPaginated(
    @Query() filter: CommentListFiltersPaginatedDto,
  ): PaginatedResponseDto<CommentEntity> {
    return this.commentService.getAllPaginated(filter);
  }

  @Post()
  @ApiCreatedResponse({ type: CommentEntity })
  @ApiUnprocessableEntityResponse({ type: UnprocessableEntityResponseDto })
  create(@Body() createCommentDto: CreateCommentDto): CommentEntity {
    return this.commentService.create(createCommentDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: CommentEntity })
  getById(@Param() { id }: IdParamDto): CommentEntity {
    return this.commentService.getById(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: CommentEntity })
  update(
    @Param() { id }: IdParamDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ): CommentEntity {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() { id }: IdParamDto) {
    this.commentService.delete(id);
  }
}
