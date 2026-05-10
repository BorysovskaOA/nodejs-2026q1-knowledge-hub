import { ArticleRepository } from './article.repository';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './models/create-article.dto';
import { CategoryService } from 'src/category/categoty.service';
import { UserService } from 'src/user/user.service';
import { UpdateArticleDto } from './models/update-article.dto';
import {
  ArticleListFiltersDto,
  ArticleListFiltersPaginatedDto,
} from './models/article-list-filter.dto';
import { Prisma } from '@prisma/client';
import { ArticleWorkflow } from './utils/article-workflow.util';
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from 'src/core/exceptions/app-errors';

@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(data: CreateArticleDto) {
    if (data.categoryId)
      await this.categoryService.validateCategoryExistWithBadRequestError(
        data.categoryId,
      );
    if (data.authorId)
      await this.userService.validateUserExistWithBadRequestError(
        data.authorId,
      );

    return this.articleRepository.create(data);
  }

  async getAll(filter: ArticleListFiltersDto) {
    return this.articleRepository.findAll(filter);
  }

  async getAllPaginated(filter: ArticleListFiltersPaginatedDto) {
    return this.articleRepository.findAllPaginated(filter);
  }

  async getById(id: string) {
    const article = await this.articleRepository.findById(id);

    if (!article)
      throw new NotFoundError(
        ArticleService.name,
        `Article ${id} is not found`,
      );

    return article;
  }

  async getOne(where: Prisma.ArticleWhereInput) {
    return await this.articleRepository.findOne(where);
  }

  async update(id: string, data: UpdateArticleDto) {
    const article = await this.getById(id);

    if (data.categoryId)
      await this.categoryService.validateCategoryExistWithBadRequestError(
        data.categoryId,
      );

    if (
      data.status &&
      !ArticleWorkflow.canTransition(article.status, data.status)
    )
      throw new ConflictError(ArticleService.name, {
        status: [
          `Cannot transition from '${article.status}' to '${data.status}'`,
        ],
      });

    return this.articleRepository.update(article.id, data);
  }

  async delete(id: string) {
    const article = await this.getById(id);

    return this.articleRepository.delete(article.id);
  }

  async validateArticleExist(id: string) {
    const user = await this.articleRepository.findById(id);

    return !!user;
  }

  async validateArticleExistWithUnprocessableEntityError(
    id: string,
    fieldName: string = 'articleId',
  ) {
    const exist = await this.validateArticleExist(id);

    if (!exist)
      throw new UnprocessableEntityError(ArticleService.name, {
        [fieldName]: [`${fieldName} does not exist`],
      });
  }
}
