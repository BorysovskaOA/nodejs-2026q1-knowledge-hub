import { z } from 'zod';
import { ArticleStatus } from '../article.interface';

export const updateArticleSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(ArticleStatus).optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateArticleDto = z.infer<typeof updateArticleSchema>;
