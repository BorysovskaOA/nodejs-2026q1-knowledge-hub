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
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { ApiPaginatedResponse } from 'src/core/decorators/api-paginated-response.decorator';
import { ArticleEntity } from './models/article.entity';
import { ValidationResponseDto } from 'src/core/dtos/validation-response.dto';

@Controller('article')
@ApiBadRequestResponse({ type: ValidationResponseDto })
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  @ApiOkResponse({ type: [ArticleEntity] })
  getAll(@Query() filter: ArticleListFiltersDto): ArticleEntity[] {
    return this.articleService.getAll(filter);
  }

  @Get('paginated')
  @ApiPaginatedResponse(ArticleEntity)
  getAllPaginated(
    @Query() filter: ArticleListFiltersPaginatdDto,
  ): PaginatedResponseDto<ArticleEntity> {
    return this.articleService.getAllPaginated(filter);
  }

  @Post()
  @ApiCreatedResponse({ type: ArticleEntity })
  create(@Body() createArticleDto: CreateArticleDto): ArticleEntity {
    return this.articleService.create(createArticleDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: ArticleEntity })
  getById(@Param() { id }: IdParamDto): ArticleEntity {
    return this.articleService.getById(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: ArticleEntity })
  update(
    @Param() { id }: IdParamDto,
    @Body() updateArticleDto: UpdateArticleDto,
  ): ArticleEntity {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() { id }: IdParamDto) {
    this.articleService.delete(id);
  }
}
