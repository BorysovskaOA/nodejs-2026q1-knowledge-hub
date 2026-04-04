import { Injectable } from '@nestjs/common';
import { Comment } from './comment.interface';
import { CommentListFiltersDto } from './dtos/comment-list-filter.dto';
import { BaseRepository } from 'src/core/base.repository';

@Injectable()
export class CommentRepository extends BaseRepository<Comment> {
  findAll({ articleId }: CommentListFiltersDto): Comment[] {
    return this.items.filter((a) => {
      if (articleId && a.articleId !== articleId) return false;

      return true;
    });
  }

  create(data: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const commentData: Omit<Comment, 'id'> = {
      ...data,
      createdAt: Date.now(),
    };

    return super.create(commentData);
  }
}
