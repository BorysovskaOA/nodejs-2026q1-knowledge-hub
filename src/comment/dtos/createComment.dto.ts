import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string(),
  articleId: z.uuid(),
  authorId: z.uuid().nullable(),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
