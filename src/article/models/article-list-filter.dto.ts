import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { SortOrder, WithSortingDto } from 'src/core/dtos/sorting.dto';
import { ArticleEntity } from './article.entity';
import { ArticleStatus } from '@prisma/client';

export class ArticleListFiltersDto {
  @ApiProperty({ enum: ArticleStatus })
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
  WithSortingDto<ArticleEntity>(
    ['createdAt', 'updatedAt', 'status', 'authorId', 'categoryId'],
    'createdAt',
    SortOrder.DESC,
  ),
) {}
