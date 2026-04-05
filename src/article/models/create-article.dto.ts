import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ArticleStatus } from './article.constants';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CreateArticleBody' })
export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status: ArticleStatus = ArticleStatus.DRAFT;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  authorId: string | null = null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  categoryId: string | null = null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags: string[] = [];
}
