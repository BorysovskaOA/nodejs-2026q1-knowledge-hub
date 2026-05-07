import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'RagSearchResponse' })
export class RagSearchEntity {
  results: Array<{
    articleId: string;
    articleTitle: string;
    chunk: string;
    similarity: number;
  }>;

  constructor(partial: Partial<RagSearchEntity>) {
    Object.assign(this, partial);
  }
}
