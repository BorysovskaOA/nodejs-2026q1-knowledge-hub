import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'RagIndexResponse' })
export class RagIndexEntity {
  indexedArticles: number;
  indexedChunks: number;
  vectorCollection: string;

  constructor(partial: Partial<RagIndexEntity>) {
    Object.assign(this, partial);
  }
}
