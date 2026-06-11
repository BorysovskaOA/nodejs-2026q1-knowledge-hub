import { ApiSchema } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsStrongPassword } from 'class-validator';

@ApiSchema({ name: 'SignupBody' })
export class SignupDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;
}
