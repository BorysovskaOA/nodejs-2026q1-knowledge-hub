import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { AiConversation as PrismaConversation } from '@prisma/client';
import { Transform } from 'class-transformer';
import { AiMessageEntity } from './message.entity';

@ApiSchema({ name: 'Conversation' })
export class AiConversationEntity implements PrismaConversation {
  id: string;
  title: string;
  userId: string;

  @ApiProperty({ type: 'number' })
  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  @ApiProperty({ type: 'number' })
  @Transform(({ value }) => value.getTime())
  updatedAt: Date;

  constructor(partial: Partial<AiConversationEntity>) {
    Object.assign(this, partial);
  }
}

export class AiConversationWithMessagesEntity extends AiConversationEntity {
  messages: AiMessageEntity[];

  constructor({ messages, ...other }: AiConversationWithMessagesEntity) {
    super(other);
    this.messages = messages || [];
  }
}
