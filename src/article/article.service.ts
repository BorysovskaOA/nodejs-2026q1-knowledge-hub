import { ArticleRepository } from './article.repository';
import {
  ForbiddenException,
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
  ArticleListFiltersPaginatdDto,
} from './models/article-list-filter.dto';
import { Prisma, UserRole } from '@prisma/client';
import { UserEntity } from 'src/user/models/user.entity';

@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(data: CreateArticleDto, user: UserEntity) {
    if (data.categoryId)
      await this.categoryService.validateCategoryExistWithException(
        data.categoryId,
      );
    if (data.authorId)
      await this.userService.validateUserExistWithException(data.authorId);

    if (user.role !== UserRole.admin && data.authorId !== user.id)
      throw new ForbiddenException();

    return this.articleRepository.create(data);
  }

  async getAll(filter: ArticleListFiltersDto) {
    return this.articleRepository.findAll(filter);
  }

  async getAllPaginated(filter: ArticleListFiltersPaginatdDto) {
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

  async validateArticleExistWithException(id: string) {
    const exist = await this.validateArticleExist(id);

    if (!exist)
      throw new UnprocessableEntityException(
        `Article with given articleId doesn't exist`,
      );
  }
}
