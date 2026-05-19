import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'SummarizeArticleResponse' })
export class SummarizeArticleEntity {
  articleId: string;
  summary: string;
  originalLength: number;
  summaryLength: number;

  constructor(partial: Partial<SummarizeArticleEntity>) {
    Object.assign(this, partial);
  }
}
