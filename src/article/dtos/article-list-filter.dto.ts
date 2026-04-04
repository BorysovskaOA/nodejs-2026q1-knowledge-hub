import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Article, ArticleStatus } from '../article.interface';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { IntersectionType } from '@nestjs/mapped-types';
import { WithSortingDto } from 'src/core/dtos/sorting.dto';

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

export class ArticleListFiltersPaginatdDto extends IntersectionType(
  ArticleListFiltersDto,
  PaginationDto,
  WithSortingDto<Article>(
    ['createdAt', 'updatedAt', 'status', 'authorId', 'categoryId'],
    'updatedAt',
  ),
) {}
