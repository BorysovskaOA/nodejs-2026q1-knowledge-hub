import { UserRole } from '../interfaces/user.interface';
import { z } from 'zod';

export const createUserSchema = z.object({
  login: z.string(),
  password: z.string(),
  role: z.enum(UserRole).default(UserRole.VIEWER),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
