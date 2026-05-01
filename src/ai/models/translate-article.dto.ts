import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'TranslateArticleBody' })
export class TranslateArticleDto {
  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @IsString()
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  sourceLanguage: string | null = null;
}
