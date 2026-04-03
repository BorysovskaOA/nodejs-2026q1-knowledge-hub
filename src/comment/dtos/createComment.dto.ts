import { IsString, IsUUID, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  articleId: string;

  @IsUUID()
  @ValidateIf((_, value) => value !== null)
  authorId: string | null;
}
