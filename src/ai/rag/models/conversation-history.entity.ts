import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'ConversationHistory' })
export class RagConversationHistoryEntity {
  history: Array<string>; // TODO - what should be here?

  constructor(partial: Partial<RagConversationHistoryEntity>) {
    Object.assign(this, partial);
  }
}
