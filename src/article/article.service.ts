import { ArticleRepository } from './article.repository';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateArticleDto } from './models/create-article.dto';
import { CategoryService } from 'src/category/categoty.service';
import { UserService } from 'src/user/user.service';
import { UpdateArticleDto } from './models/update-article.dto';
import {
  ArticleListFiltersDto,
  ArticleListFiltersPaginatedDto,
} from './models/article-list-filter.dto';
import { Prisma } from '@prisma/client';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { ArticleWorkflow } from './utils/article-workflow.util';

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
      await this.categoryService.validateCategoryExistWithException(
        data.categoryId,
      );
    if (data.authorId)
      await this.userService.validateUserExistWithException(data.authorId);

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

    if (!article) throw new NotFoundException();

    return article;
  }

  async getOne(where: Prisma.ArticleWhereInput) {
    return await this.articleRepository.findOne(where);
  }

  async update(id: string, data: UpdateArticleDto) {
    const article = await this.getById(id);

    if (data.categoryId)
      await this.categoryService.validateCategoryExistWithException(
        data.categoryId,
      );

    if (
      data.status &&
      !ArticleWorkflow.canTransition(article.status, data.status)
    )
      throw new ConflictException({
        statusCode: StatusCodes.CONFLICT,
        error: getReasonPhrase(StatusCodes.CONFLICT),
        message: [
          {
            field: 'status',
            errors: [
              `Cannot transition from '${article.status}' to '${data.status}'`,
            ],
          },
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

  async validateArticleExistWithException(
    id: string,
    fieldName: string = 'articleId',
  ) {
    const exist = await this.validateArticleExist(id);

    if (!exist)
      throw new UnprocessableEntityException({
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        error: getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY),
        message: [
          {
            field: fieldName,
            errors: [`${fieldName} does not exist`],
          },
        ],
      });
  }
}
