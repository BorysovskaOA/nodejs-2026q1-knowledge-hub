import { IsOptional, IsUUID } from 'class-validator';

export class CommentListFiltersDto {
  @IsOptional()
  @IsUUID()
  articleId?: string;
}
