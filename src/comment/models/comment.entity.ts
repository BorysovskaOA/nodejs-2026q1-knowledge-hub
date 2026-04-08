import { ApiSchema } from '@nestjs/swagger';
import { Comment as PrismaComment } from '@prisma/client';

@ApiSchema({ name: 'Comment' })
export class CommentEntity implements PrismaComment {
  id: string;
  content: string;
  articleId: string;
  authorId: string | null;
  createdAt: Date;

  constructor(partial: Partial<CommentEntity>) {
    Object.assign(this, partial);
  }
}
