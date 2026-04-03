import { ArticleStatus } from '../article.interface';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(ArticleStatus)
  status: ArticleStatus;

  @IsUUID()
  @ValidateIf((_, value) => value !== null)
  authorId: string | null;

  @IsUUID()
  @ValidateIf((_, value) => value !== null)
  categoryId: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags: string[];
}
