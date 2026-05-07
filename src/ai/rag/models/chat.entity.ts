import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'RagChatResponse' })
export class RagChatEntity {
  answer: string;
  sources: Array<{
    articleId: string;
    articleTitle: string;
    relevantChunk: string;
  }>;
  conversationId: string;

  constructor(partial: Partial<RagChatEntity>) {
    Object.assign(this, partial);
  }
}
