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
import {
  CommentListFiltersDto,
  CommentListFiltersPaginatedDto,
} from './models/comment-list-filter.dto';
import { Prisma } from '@prisma/client';
import { UpdateCommentDto } from './models/update-comment.dto';

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
    const comment = await this.commentRepository.findById(id);

    if (!comment) throw new NotFoundException();

    return comment;
  }

  async getOne(where: Prisma.CommentWhereInput) {
    return await this.commentRepository.findOne(where);
  }

  async update(id: string, data: UpdateCommentDto) {
    const comment = await this.getById(id);

    return this.commentRepository.update(comment.id, data);
  }

  async delete(id: string) {
    const comment = await this.getById(id);

    return this.commentRepository.delete(comment.id);
  }
}
