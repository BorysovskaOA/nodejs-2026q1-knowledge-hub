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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  ExtendedExceptionResponse,
  GeneralExceptionResponse,
} from 'src/core/utils/exception-responses.util';
import { Authorize } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';

@ApiBearerAuth('accessToken')
@Controller('comment')
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  @ApiOkResponse({ type: [CommentEntity] })
  async getAll(
    @Query() filter: CommentListFiltersDto,
  ): Promise<CommentEntity[]> {
    return this.commentService.getAll(filter);
  }

  @Get('paginated')
  @ApiPaginatedResponse(CommentEntity)
  async getAllPaginated(
    @Query() filter: CommentListFiltersPaginatedDto,
  ): Promise<PaginatedResponseDto<CommentEntity>> {
    return this.commentService.getAllPaginated(filter);
  }

  @Post()
  @Authorize([
    { roles: [UserRole.admin] },
    { roles: [UserRole.editor], constraints: { bodyPropertyName: 'authorId' } },
  ])
  @ApiCreatedResponse({ type: CommentEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  @ApiUnprocessableEntityResponse(ExtendedExceptionResponse(422))
  async create(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    return this.commentService.create(createCommentDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: CommentEntity })
  async getById(@Param() { id }: IdParamDto): Promise<CommentEntity> {
    return this.commentService.getById(id);
  }

  @Put(':id')
  @Authorize([
    { roles: [UserRole.admin] },
    {
      roles: [UserRole.editor],
      constraints: {
        service: CommentService,
        paramName: 'id',
        propertyName: 'authorId',
      },
    },
  ])
  @ApiOkResponse({ type: CommentEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  async update(
    @Param() { id }: IdParamDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @Authorize([
    { roles: [UserRole.admin] },
    {
      roles: [UserRole.editor],
      constraints: {
        service: CommentService,
        paramName: 'id',
        propertyName: 'authorId',
      },
    },
  ])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  async delete(@Param() { id }: IdParamDto) {
    await this.commentService.delete(id);
  }
}
