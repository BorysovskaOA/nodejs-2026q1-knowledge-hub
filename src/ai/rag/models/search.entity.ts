import { ApiSchema } from '@nestjs/swagger';

interface ArticleResult {
  articleId: string;
  articleTitle: string;
  chunk: string;
  similarity: number;
}

@ApiSchema({ name: 'RagSearchResponse' })
export class RagSearchEntity {
  results: ArticleResult[];

  constructor(partial: Partial<RagSearchEntity>) {
    Object.assign(this, partial);
  }
}
