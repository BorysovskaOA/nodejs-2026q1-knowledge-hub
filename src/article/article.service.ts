import { ArticleRepository } from './article.repository';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ArticleStatus } from './article.interface';
import { CreateArticleDto } from './dtos/createArticle.dto';
import { CategoryService } from 'src/category/categoty.service';
import { UserService } from 'src/user/user.service';
import { UpdateArticleDto } from './dtos/updateArticle.dto';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class ArticleService {
  constructor(
    private articleRepository: ArticleRepository,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => CommentService))
    private commentService: CommentService,
  ) {}

  create(data: CreateArticleDto) {
    if (data.categoryId)
      this.categoryService.validateCategoryExistWithException(data.categoryId);
    if (data.authorId)
      this.userService.validateUserExistWithException(data.authorId);

    return this.articleRepository.create(data);
  }

  getAll(filters?: {
    status?: ArticleStatus;
    categoryId?: string | null;
    tag?: string;
  }) {
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

    if (data.categoryId)
      this.categoryService.validateCategoryExistWithException(data.categoryId);

    const updatedArticel = this.articleRepository.update(id, data);
    if (!updatedArticel) {
      throw new InternalServerErrorException();
    }

    return updatedArticel;
  }

  delete(id: string) {
    const article = this.articleRepository.findOne(id);

    if (!article) {
      throw new NotFoundException();
    }

    const result = this.articleRepository.delete(id);

    this.commentService.deleteAllArticleComments(id);

    return result;
  }

  validateArticleExist(id: string) {
    const user = this.articleRepository.findOne(id);

    return !!user;
  }

  validateArticleExistWithException(id: string) {
    const exist = this.validateArticleExist(id);

    if (!exist) {
      throw new UnprocessableEntityException();
    }
  }

  unsetArticleCategory(id: string) {
    const updatedArticlesData = this.articleRepository
      .findAll({ categoryId: id })
      .map((a) => ({
        id: a.id,
        categoryId: null,
      }));

    return this.articleRepository.updateBatch(updatedArticlesData);
  }

  unsetArticleAuthor(id: string) {
    const updatedArticlesData = this.articleRepository
      .findAll({ authorId: id })
      .map((a) => ({
        id: a.id,
        authorId: null,
      }));

    return this.articleRepository.updateBatch(updatedArticlesData);
  }
}
