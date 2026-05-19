import { IsNotEmpty, IsString } from 'class-validator';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'GenerateBody' })
export class GenerateDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
