import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  AiMessage,
  AiConversation as PrismaConversation,
} from '@prisma/client';
import { Transform } from 'class-transformer';

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

  messages: AiMessage[];

  constructor(partial: Partial<AiConversationEntity>) {
    Object.assign(this, partial);
  }
}
