import { IsNotEmpty, IsUUID } from 'class-validator';

export class ArticleIdParamDto {
  @IsNotEmpty()
  @IsUUID()
  articleId: string;
}
