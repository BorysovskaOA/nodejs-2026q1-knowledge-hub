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
import { ArticleService } from './article.service';
import { Article } from './article.interface';
import { ZodValidationPipe } from 'src/utils/zodValidation.pipe';
import {
  UpdateArticleDto,
  updateArticleSchema,
} from './dtos/updateArticle.dto';
import {
  CreateArticleDto,
  createArticleSchema,
} from './dtos/createArticle.dto';
import {
  ArticleListFiltersDto,
  articleListFiltersSchema,
} from './dtos/listFilters.dto';

@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  getAll(
    @Query(new ZodValidationPipe(articleListFiltersSchema))
    filter: ArticleListFiltersDto,
  ): Article[] {
    return this.articleService.getAll(filter);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createArticleSchema))
    createArticleDto: CreateArticleDto,
  ): Article {
    return this.articleService.create(createArticleDto);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Article {
    return this.articleService.getById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateArticleSchema))
    updateArticleDto: UpdateArticleDto,
  ): Article | undefined {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.delete(id);
  }
}
