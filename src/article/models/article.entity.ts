import { ApiSchema } from '@nestjs/swagger';
import { ArticleStatus, Article as PrismaArticle } from '@prisma/client';

@ApiSchema({ name: 'Article' })
export class ArticleEntity implements PrismaArticle {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ArticleEntity>) {
    Object.assign(this, partial);
  }
}
