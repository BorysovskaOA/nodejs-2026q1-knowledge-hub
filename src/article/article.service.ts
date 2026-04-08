import { ArticleRepository } from './article.repository';
import {
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

  async getAllPaginated(filter: ArticleListFiltersPaginatdDto) {
    return this.articleRepository.findAllPaginated(filter);
  }

  async getById(id: string) {
    const article = await this.articleRepository.findOne(id);

    if (!article) throw new NotFoundException();

    return article;
  }

  async update(id: string, data: UpdateArticleDto) {
    const article = await this.articleRepository.findOne(id);

    if (!article) throw new NotFoundException();

    if (data.categoryId)
      await this.categoryService.validateCategoryExistWithException(
        data.categoryId,
      );

    return this.articleRepository.update(id, data);
  }

  delete(id: string) {
    const article = this.articleRepository.findOne(id);

    if (!article) throw new NotFoundException();

    return this.articleRepository.delete(id);
  }

  async validateArticleExist(id: string) {
    const user = await this.articleRepository.findOne(id);

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
