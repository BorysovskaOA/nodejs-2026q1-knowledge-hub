import { CommentRepository } from './comment.repository';
import {
  forwardRef,
  Inject,
  Injectable,
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

  async create(data: CreateCommentDto) {
    await this.articleService.validateArticleExistWithException(data.articleId);
    if (data.authorId)
      await this.userService.validateUserExistWithException(data.authorId);

    return this.commentRepository.create(data);
  }

  async getAll(filter: CommentListFiltersDto) {
    return this.commentRepository.findAll(filter);
  }

  async getAllPaginated(filter: CommentListFiltersPaginatedDto) {
    return this.commentRepository.findAllPaginated(filter);
  }

  async getById(id: string) {
    const comment = await this.commentRepository.findOne(id);

    if (!comment) throw new NotFoundException();

    return comment;
  }

  async update(id: string, data: UpdateArticleDto) {
    const comment = this.commentRepository.findOne(id);

    if (!comment) throw new NotFoundException();

    return this.commentRepository.update(id, data);
  }

  async delete(id: string) {
    const comment = await this.commentRepository.findOne(id);

    if (!comment) throw new NotFoundException();

    return this.commentRepository.delete(id);
  }
}
