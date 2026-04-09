import { ApiSchema } from '@nestjs/swagger';
import { ArticleStatus, Article as PrismaArticle } from '@prisma/client';
import { Transform } from 'class-transformer';

@ApiSchema({ name: 'Article' })
export class ArticleEntity implements PrismaArticle {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  authorId: string | null;
  categoryId: string | null;
  tags: string[];

  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  @Transform(({ value }) => value.getTime())
  updatedAt: Date;

  constructor(partial: Partial<ArticleEntity>) {
    Object.assign(this, partial);
  }
}
