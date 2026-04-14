import { Request } from 'express';
import { AuthPayloadUser } from '../../auth/models/auth.entity';

export interface AuthenticatedRequest extends Request {
  user: AuthPayloadUser;
}
