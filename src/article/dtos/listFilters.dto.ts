import { z } from 'zod';
import { ArticleStatus } from '../article.interface';

export const articleListFiltersSchema = z
  .object({
    status: z.enum(ArticleStatus).optional(),
    categoryId: z.string().nullish(),
    tag: z.string().optional(),
  })
  .optional()
  .default({});

export type ArticleListFiltersDto = z.infer<typeof articleListFiltersSchema>;
