import { ResponseMapper } from 'src/utils/useResponseMapper.decorator';
import { User } from './user.interface';

type UserResponse = Omit<User, 'password'>;

export class UserMapper implements ResponseMapper {
  map(data: User): UserResponse {
    return {
      id: data.id,
      login: data.login,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
