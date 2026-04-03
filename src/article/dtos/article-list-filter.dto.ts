import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { ArticleStatus } from '../article.interface';

export class ArticleListFiltersDto {
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tag?: string;
}
