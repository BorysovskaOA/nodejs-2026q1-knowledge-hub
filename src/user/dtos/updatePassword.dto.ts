import { z } from 'zod';

export const updatePassworSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
});

export type UpdatePasswordDto = z.infer<typeof updatePassworSchema>;
