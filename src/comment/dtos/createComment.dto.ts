import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string(),
  articleId: z.string(),
  authorId: z.string(),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
