import { ApiSchema } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/core/base.entity';
import { UserRole } from './user.constants';

@ApiSchema({ name: 'User' })
export class UserEntity extends BaseEntity<UserEntity> {
  @Exclude()
  password: string;

  login: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;

  constructor(userData: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>) {
    const createdAt = Date.now();

    super({
      ...userData,
      createdAt,
      updatedAt: createdAt,
    });
  }

  update(userData: Partial<UserEntity>): UserEntity {
    return super.update({
      ...userData,
      updatedAt: Date.now(),
    });
  }
}
