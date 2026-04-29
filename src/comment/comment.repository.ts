import { Injectable } from '@nestjs/common';
import { CommentListFiltersDto } from './models/comment-list-filter.dto';
import { BaseRepository } from 'src/core/base.repository';
import { CommentEntity } from './models/comment.entity';

@Injectable()
export class CommentRepository extends BaseRepository<CommentEntity> {
  constructor() {
    super(CommentEntity);
  }

  findAll({ articleId }: CommentListFiltersDto): CommentEntity[] {
    return this.items.filter((a) => {
      if (articleId && a.articleId !== articleId) return false;

      return true;
    });
  }
}
