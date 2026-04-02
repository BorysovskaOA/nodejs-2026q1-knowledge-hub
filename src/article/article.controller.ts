import { UserService } from './../user/user.service';
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
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { Article, ArticleStatus } from './interfaces/article.interface';
import { ZodValidationPipe } from 'src/utils/zodValidationPipe';
import {
  UpdateArticleDto,
  updateArticleSchema,
} from './dtos/updateArticle.dto';
import {
  CreateArticleDto,
  createArticleSchema,
} from './dtos/createArticle.dto';
import { CategoryService } from 'src/category/categoty.service';

@Controller('article')
export class ArticleController {
  constructor(
    private articleService: ArticleService,
    private categoryService: CategoryService,
    private userService: UserService,
  ) {}

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
    const createdAt = Date.now();

    const category = this.categoryService.getById(createArticleDto.categoryId);

    if (!category) {
      throw new BadRequestException();
    }

    const author = this.userService.getById(createArticleDto.authorId);

    if (!author) {
      throw new BadRequestException();
    }

    const article: Article = {
      id: crypto.randomUUID(),
      ...createArticleDto,
      createdAt,
      updatedAt: createdAt,
    };

    this.articleService.create(article);

    return article;
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Article {
    const article = this.articleService.getById(id);

    if (!article) {
      throw new NotFoundException();
    }

    return article;
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updateArticleSchema))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Article {
    const article = this.articleService.getById(id);

    if (!article) {
      throw new NotFoundException();
    }

    const category = this.categoryService.getById(updateArticleDto.categoryId);

    if (!category) {
      throw new BadRequestException();
    }

    const updatedArticle: Article = {
      ...article,
      ...updateArticleDto,
    };

    this.articleService.update(id, updatedArticle);

    return updatedArticle;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    const article = this.articleService.getById(id);

    if (!article) {
      throw new NotFoundException();
    }

    this.articleService.delete(id);
  }
}
