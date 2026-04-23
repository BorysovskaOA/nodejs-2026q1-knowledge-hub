import { ApiSchema } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  ValidateIf,
  IsOptional,
} from 'class-validator';

@ApiSchema({ name: 'CreateCommentBody' })
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsUUID()
  articleId: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  authorId: string | null = null;
}
