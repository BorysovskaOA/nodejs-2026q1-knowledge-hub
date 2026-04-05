import { ApiSchema } from '@nestjs/swagger';
import { BaseEntity } from 'src/core/base.entity';

@ApiSchema({ name: 'Comment' })
export class CommentEntity extends BaseEntity<CommentEntity> {
  id: string;
  content: string;
  articleId: string;
  authorId: string | null;
  createdAt: number;

  constructor(commentData: Omit<CommentEntity, 'id' | 'createdAt'>) {
    const createdAt = Date.now();

    super({
      ...commentData,
      createdAt,
    });
  }
}
