import { Request } from 'express';
import { UserEntity } from 'src/user/models/user.entity';

export interface AuthenticatedRequest extends Request {
  user: UserEntity;
}
