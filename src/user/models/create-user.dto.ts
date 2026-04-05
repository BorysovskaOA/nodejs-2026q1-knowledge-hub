import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from './user.constants';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CreateUserBody' })
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole = UserRole.VIEWER;
}
