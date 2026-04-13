import { Request } from 'express';
import { AuthPayloadUser } from './atuh.entity';

export interface AuthenticatedRequest extends Request {
  user: AuthPayloadUser;
}
