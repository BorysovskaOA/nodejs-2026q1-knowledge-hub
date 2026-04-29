import { ApiSchema } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@ApiSchema({ name: 'RefreshBody' })
export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
