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
import { ArticleService } from './article.service';
import { UpdateArticleDto } from './models/update-article.dto';
import { CreateArticleDto } from './models/create-article.dto';
import {
  ArticleListFiltersDto,
  ArticleListFiltersPaginatdDto,
} from './models/article-list-filter.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { ApiPaginatedResponse } from 'src/core/decorators/api-paginated-response.decorator';
import { ArticleEntity } from './models/article.entity';
import { ValidationResponseDto } from 'src/core/dtos/validation-response.dto';
import { ExceptionResponse } from 'src/core/utils/exception-response.util';
import { Authorize } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';

@ApiBearerAuth('accessToken')
@Controller('article')
@ApiBadRequestResponse({ type: ValidationResponseDto })
@ApiInternalServerErrorResponse(ExceptionResponse(500))
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  @ApiOkResponse({ type: [ArticleEntity] })
  async getAll(
    @Query() filter: ArticleListFiltersDto,
  ): Promise<ArticleEntity[]> {
    return this.articleService.getAll(filter);
  }

  @Get('paginated')
  @ApiPaginatedResponse(ArticleEntity)
  async getAllPaginated(
    @Query() filter: ArticleListFiltersPaginatdDto,
  ): Promise<PaginatedResponseDto<ArticleEntity>> {
    return this.articleService.getAllPaginated(filter);
  }

  @Post()
  @Authorize({ roles: [UserRole.admin, UserRole.editor] })
  @ApiCreatedResponse({ type: ArticleEntity })
  async create(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    return this.articleService.create(createArticleDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: ArticleEntity })
  async getById(@Param() { id }: IdParamDto): Promise<ArticleEntity> {
    return this.articleService.getById(id);
  }

  @Put(':id')
  @Authorize({
    roles: [UserRole.admin],
    owner: {
      service: ArticleService,
      paramName: 'id',
      propertyName: 'authorId',
    },
  })
  @ApiOkResponse({ type: ArticleEntity })
  async update(
    @Param() { id }: IdParamDto,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @Authorize({
    roles: [UserRole.admin],
    owner: {
      service: ArticleService,
      paramName: 'id',
      propertyName: 'authorId',
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() { id }: IdParamDto) {
    await this.articleService.delete(id);
  }
}
