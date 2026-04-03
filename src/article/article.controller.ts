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
import { UpdateArticleDto } from './dtos/updateArticle.dto';
import { CreateArticleDto } from './dtos/createArticle.dto';
import { ArticleListFiltersDto } from './dtos/listFilters.dto';

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
  getById(@Param('id', ParseUUIDPipe) id: string): Article {
    return this.articleService.getById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Article | undefined {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.delete(id);
  }
}
