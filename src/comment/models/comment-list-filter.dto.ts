import { IntersectionType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { WithSortingDto } from 'src/core/dtos/sorting.dto';
import { CommentEntity } from './comment.entity';

export class CommentListFiltersDto {
  @IsNotEmpty()
  @IsUUID()
  articleId?: string;
}

export class CommentListFiltersPaginatedDto extends IntersectionType(
  CommentListFiltersDto,
  PaginationDto,
  WithSortingDto<CommentEntity>(['createdAt'], 'createdAt'),
) {}
