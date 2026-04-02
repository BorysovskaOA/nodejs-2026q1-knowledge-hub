import { z } from 'zod';
import { ArticleStatus } from '../interfaces/article.interface';

export const createArticleSchema = z.object({
  title: z.string(),
  content: z.string(),
  status: z.enum(ArticleStatus),
  authorId: z.string(),
  categoryId: z.string(),
  tags: z.array(z.string()),
});

export type CreateArticleDto = z.infer<typeof createArticleSchema>;
