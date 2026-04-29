import { ApiSchema } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@ApiSchema({ name: 'UpdateCommentBody' })
export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
