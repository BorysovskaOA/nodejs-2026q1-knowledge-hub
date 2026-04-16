import { ApiSchema, IntersectionType } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UserEntity } from 'src/user/models/user.entity';

@ApiSchema({ name: 'AuthResponse' })
export class AuthEntity {
  accessToken: string;
  refreshToken: string;

  constructor(partial: Partial<AuthEntity>) {
    Object.assign(this, partial);
  }
}

@ApiSchema({ name: 'AuthUserResponse' })
export class AuthUserEntity extends IntersectionType(UserEntity, AuthEntity) {
  constructor(partial: Partial<AuthUserEntity>) {
    super();
    Object.assign(this, partial);
  }
}

export class AuthPayloadUser {
  userId: string;
  login: string;
  role: UserRole;
  version: number;
}
