import { ApiSchema } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@ApiSchema({ name: 'LoginBody' })
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
