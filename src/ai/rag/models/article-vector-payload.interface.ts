import { ArticleStatus } from '@prisma/client';

export interface ArticleVectorPayload {
  articleId: string;
  title: string;
  status: ArticleStatus;
  categoryId: string | null;
  tags: string[];
  content: string;
  chunkIndex: number;
}
