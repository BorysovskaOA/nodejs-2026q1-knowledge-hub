import { RagService } from 'src/ai/rag/rag.service';
import { ArticleRepository } from './article.repository';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './models/create-article.dto';
import { CategoryService } from 'src/category/categoty.service';
import { UserService } from '../user/user.service';
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    private categoryService: CategoryService,
    private userService: UserService,
    @Inject(forwardRef(() => RagService))
    private ragService: RagService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
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
        `Article ${id} is not found`,
        ArticleService.name,
      );

    return article;
  }

  async getOne(where: Prisma.ArticleWhereInput) {
    return await this.articleRepository.findOne(where);
  }

  async count(where: Prisma.ArticleWhereInput) {
    return await this.articleRepository.count(where);
  }

  async getMany(
    params: {
      where: Prisma.ArticleWhereInput;
      take?: number | undefined;
      skip?: number | undefined;
    },
    tx?: Prisma.TransactionClient,
  ) {
    return await this.articleRepository.findMany(params, tx);
  }

  async updateMany(
    ids: string[],
    data: Prisma.ArticleUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return await this.articleRepository.updateMany(ids, data, tx);
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
      throw new ConflictError(
        {
          status: [
            `Cannot transition from '${article.status}' to '${data.status}'`,
          ],
        },
        ArticleService.name,
      );

    return this.prisma.$transaction(async (tx) => {
      const updatedArticle = await this.articleRepository.update(
        article.id,
        {
          ...data,
          isIndexed: false,
        },
        tx,
      );

      this.cacheManager.set(
        `article:${id}:lastUpdated`,
        updatedArticle.updatedAt.toString(),
        0,
      );
      await this.ragService.reindexArticle(article.id, tx);

      return updatedArticle;
    });
  }

  async delete(id: string) {
    const article = await this.getById(id);

    const response = await this.articleRepository.delete(article.id);

    await this.ragService.deleteArticleIndex(id, true);

    return response;
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
      throw new UnprocessableEntityError(
        { [fieldName]: [`${fieldName} does not exist`] },
        ArticleService.name,
      );
  }
}
