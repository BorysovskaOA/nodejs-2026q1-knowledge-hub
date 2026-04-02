import { z } from 'zod';
import { ArticleStatus } from '../interfaces/article.interface';

export const updateArticleSchema = z.object({
  title: z.string(),
  content: z.string(),
  status: z.enum(ArticleStatus),
  categoryId: z.string(),
  tags: z.array(z.string()),
});

export type UpdateArticleDto = z.infer<typeof updateArticleSchema>;
