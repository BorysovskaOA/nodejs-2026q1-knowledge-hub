import { ApiSchema } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { UserRole, User as PrismaUser } from '@prisma/client';

@ApiSchema({ name: 'User' })
export class UserEntity implements PrismaUser {
  id: string;

  @Exclude()
  passwordHash: string;

  login: string;
  role: UserRole;

  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  @Transform(({ value }) => value.getTime())
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
