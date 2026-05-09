import { ApiSchema } from '@nestjs/swagger';
import { AiMessageEntity } from './message.entity';

@ApiSchema({ name: 'ConversationHistory' })
export class RagConversationHistoryEntity {
  history: AiMessageEntity[];

  constructor(partial: Partial<RagConversationHistoryEntity>) {
    Object.assign(this, partial);
  }
}
