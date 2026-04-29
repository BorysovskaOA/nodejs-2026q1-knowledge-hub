import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Comment as PrismaComment } from '@prisma/client';
import { Transform } from 'class-transformer';

@ApiSchema({ name: 'Comment' })
export class CommentEntity implements PrismaComment {
  id: string;
  content: string;
  articleId: string;
  authorId: string | null;

  @ApiProperty({ type: 'number' })
  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  constructor(partial: Partial<CommentEntity>) {
    Object.assign(this, partial);
  }
}
