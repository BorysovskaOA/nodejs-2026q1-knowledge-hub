import { ApiSchema } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@ApiSchema({ name: 'CreateCategoryBody' })
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
