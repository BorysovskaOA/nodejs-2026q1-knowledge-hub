import { ApiHideProperty, ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { UserRole, User as PrismaUser } from '@prisma/client';

@ApiSchema({ name: 'User' })
export class UserEntity implements PrismaUser {
  id: string;
  login: string;

  @ApiHideProperty()
  @Exclude()
  passwordHash: string;

  @ApiHideProperty()
  @Exclude()
  refreshTokenHash: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ type: 'number' })
  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  @ApiProperty({ type: 'number' })
  @Transform(({ value }) => value.getTime())
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
