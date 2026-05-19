import { ApiSchema } from '@nestjs/swagger';

interface Source {
  articleId: string;
  articleTitle: string;
  relevantChunk: string;
}

@ApiSchema({ name: 'RagChatResponse' })
export class RagChatEntity {
  answer: string;
  sources: Source[];
  conversationId: string;

  constructor(partial: Partial<RagChatEntity>) {
    Object.assign(this, partial);
  }
}
