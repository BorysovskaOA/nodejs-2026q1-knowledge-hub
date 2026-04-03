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
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateArticleDto } from 'src/article/dtos/update-article.dto';

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

  getAll({ articleId }: { articleId?: string }) {
    return this.commentRepository.findAll({ articleId });
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
      .findAll({
        articleId: id,
      })
      .map((c) => c.id);

    return this.commentRepository.deleteBatch(deleteCommentIds);
  }

  deleteAllAuthorComments(id: string) {
    const deleteCommentIds = this.commentRepository
      .findAll({
        authorId: id,
      })
      .map((c) => c.id);

    return this.commentRepository.deleteBatch(deleteCommentIds);
  }
}
