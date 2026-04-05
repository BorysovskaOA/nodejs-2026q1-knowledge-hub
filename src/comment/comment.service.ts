import { CommentRepository } from './comment.repository';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ArticleService } from 'src/article/article.service';
import { CreateCommentDto } from './models/create-comment.dto';
import { UpdateArticleDto } from 'src/article/models/update-article.dto';
import {
  CommentListFiltersDto,
  CommentListFiltersPaginatedDto,
} from './models/comment-list-filter.dto';

@Injectable()
export class CommentService {
  constructor(
    private commentRepository: CommentRepository,
    @Inject(forwardRef(() => ArticleService))
    private articleService: ArticleService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  create(data: CreateCommentDto) {
    this.articleService.validateArticleExistWithException(data.articleId);
    if (data.authorId)
      this.userService.validateUserExistWithException(data.authorId);

    return this.commentRepository.create(data);
  }

  getAll(filter: CommentListFiltersDto) {
    return this.commentRepository.findAll(filter);
  }

  getAllPaginated(filter: CommentListFiltersPaginatedDto) {
    return this.commentRepository.findAllPaginated(filter);
  }

  getById(id: string) {
    const comment = this.commentRepository.findOne(id);

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  update(id: string, data: UpdateArticleDto) {
    const comment = this.commentRepository.findOne(id);

    if (!comment) {
      throw new NotFoundException();
    }

    const updatedComment = this.commentRepository.update(id, data);

    if (!updatedComment) {
      throw new InternalServerErrorException();
    }

    return updatedComment;
  }

  delete(id: string) {
    const comment = this.commentRepository.findOne(id);

    if (!comment) {
      throw new NotFoundException();
    }

    return this.commentRepository.delete(id);
  }

  deleteAllArticleComments(id: string) {
    const deleteCommentIds = this.commentRepository
      .findAllRelated('articleId', id)
      .map((c) => c.id);

    return this.commentRepository.deleteBatch(deleteCommentIds);
  }

  deleteAllAuthorComments(id: string) {
    const deleteCommentIds = this.commentRepository
      .findAllRelated('authorId', id)
      .map((c) => c.id);

    return this.commentRepository.deleteBatch(deleteCommentIds);
  }
}
