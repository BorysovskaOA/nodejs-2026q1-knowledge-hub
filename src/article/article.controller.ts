import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { Article, ArticleStatus } from './article.interface';
import { ZodValidationPipe } from 'src/utils/zodValidation.pipe';
import {
  UpdateArticleDto,
  updateArticleSchema,
} from './dtos/updateArticle.dto';
import {
  CreateArticleDto,
  createArticleSchema,
} from './dtos/createArticle.dto';

@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  getAll(
    @Query('status', new ParseEnumPipe(ArticleStatus)) status: ArticleStatus,
    @Query('categoryId', ParseUUIDPipe) categoryId: string,
    @Query('tag', ParseUUIDPipe) tag: string,
  ): Article[] {
    return this.articleService.getAll({ status, categoryId, tag });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createArticleSchema))
  create(@Body() createArticleDto: CreateArticleDto): Article {
    return this.articleService.create(createArticleDto);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Article {
    return this.articleService.getById(id);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updateArticleSchema))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Article {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.delete(id);
  }
}
