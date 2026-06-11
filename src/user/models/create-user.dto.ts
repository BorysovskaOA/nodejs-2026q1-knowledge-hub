import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiSchema } from '@nestjs/swagger';
import { SignupDto } from 'src/auth/models/signup.dto';

@ApiSchema({ name: 'CreateUserBody' })
export class CreateUserDto extends SignupDto {
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole = UserRole.viewer;
}
