import { Injectable } from '@nestjs/common';
import { User } from './user.interface';
import { BaseRepository } from 'src/core/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const createdAt = Date.now();
    const userData: Omit<User, 'id'> = {
      ...data,
      createdAt,
      updatedAt: createdAt,
    };

    return super.create(userData);
  }

  update(id: string, data: Partial<User>): User | undefined {
    const userData: Omit<Partial<User>, 'id'> = {
      ...data,
      updatedAt: Date.now(),
    };

    return super.update(id, userData);
  }
}
