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
import { Article } from './article.interface';
import { UpdateArticleDto } from './dtos/update-article.dto';
import { CreateArticleDto } from './dtos/create-article.dto';
import { ArticleListFiltersDto } from './dtos/article-list-filter.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';

@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  getAll(@Query() filter: ArticleListFiltersDto): Article[] {
    return this.articleService.getAll(filter);
  }

  @Post()
  create(@Body() createArticleDto: CreateArticleDto): Article {
    return this.articleService.create(createArticleDto);
  }

  @Get(':id')
  getById(@Param() { id }: IdParamDto): Article {
    return this.articleService.getById(id);
  }

  @Put(':id')
  update(
    @Param() { id }: IdParamDto,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Article | undefined {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() { id }: IdParamDto) {
    return this.articleService.delete(id);
  }
}
