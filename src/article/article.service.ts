import { ArticleRepository } from './article.repository';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArticleStatus } from './article.interface';
import { CreateArticleDto } from './dtos/createArticle.dto';
import { CategoryService } from 'src/category/categoty.service';
import { UserService } from 'src/user/user.service';
import { UpdateArticleDto } from './dtos/updateArticle.dto';

@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    private userService: UserService,
  ) {}

  create(data: CreateArticleDto) {
    this.categoryService.validateCategoryExistWithException(data.categoryId);
    this.userService.validateUserExistWithException(data.authorId);

    return this.articleRepository.create(data);
  }

  getAll(filters: { status: ArticleStatus; categoryId: string; tag: string }) {
    return this.articleRepository.findAll(filters);
  }

  getById(id: string) {
    const article = this.articleRepository.findOne(id);

    if (!article) {
      throw new NotFoundException();
    }

    return article;
  }

  update(id: string, data: UpdateArticleDto) {
    const article = this.articleRepository.findOne(id);

    if (!article) {
      throw new NotFoundException();
    }

    this.categoryService.validateCategoryExistWithException(data.categoryId);

    return this.articleRepository.update(id, data);
  }

  delete(id: string) {
    const article = this.articleRepository.findOne(id);

    if (!article) {
      throw new NotFoundException();
    }

    return this.articleRepository.delete(id);
  }

  validateArticleExist(id: string) {
    const user = this.articleRepository.findOne(id);

    return !!user;
  }

  validateArticleExistWithException(id: string) {
    const exist = this.validateArticleExist(id);

    if (!exist) {
      throw new BadRequestException();
    }
  }

  unsetArticleCategoryId(id: string) {
    const updatedArticlesData = this.articleRepository
      .findAll({ categoryId: id })
      .map((a) => ({
        id: a.id,
        categoryId: null,
      }));

    return this.articleRepository.updateBatch(updatedArticlesData);
  }

  unsetArticleAuthorId(id: string) {
    const updatedArticlesData = this.articleRepository
      .findAll({ authorId: id })
      .map((a) => ({
        id: a.id,
        authorId: null,
      }));

    return this.articleRepository.updateBatch(updatedArticlesData);
  }
}
