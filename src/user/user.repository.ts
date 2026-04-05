import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base.repository';
import { UserEntity } from './models/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor() {
    super(UserEntity);
  }
}
