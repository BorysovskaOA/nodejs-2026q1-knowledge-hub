import { ApiSchema } from '@nestjs/swagger';
import { AiMessage } from '@prisma/client';

@ApiSchema({ name: 'ConversationHistory' })
export class RagConversationHistoryEntity {
  history: Array<AiMessage>;

  constructor(partial: Partial<RagConversationHistoryEntity>) {
    Object.assign(this, partial);
  }
}
