import {
  IsString,
  IsUUID,
  IsNotEmpty,
  ValidateIf,
  IsOptional,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  articleId: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  authorId: string | null = null;
}
