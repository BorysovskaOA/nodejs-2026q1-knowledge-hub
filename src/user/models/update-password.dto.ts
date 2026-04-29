import { ApiSchema } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@ApiSchema({ name: 'UpdatePasswordBody' })
export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
