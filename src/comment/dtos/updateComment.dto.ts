import { z } from 'zod';

export const updateCommentSchema = z.object({
  content: z.string(),
});

export type UpdateCommentDto = z.infer<typeof updateCommentSchema>;
