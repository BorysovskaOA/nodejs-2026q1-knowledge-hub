import { IntersectionType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { WithSortingDto } from 'src/core/dtos/sorting.dto';
import { Comment } from '../comment.interface';

export class CommentListFiltersDto {
  @IsOptional()
  @IsUUID()
  articleId?: string;
}

export class CommentListFiltersPaginatedDto extends IntersectionType(
  CommentListFiltersDto,
  PaginationDto,
  WithSortingDto<Comment>(['createdAt'], 'createdAt'),
) {}
