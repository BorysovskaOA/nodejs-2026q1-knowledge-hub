import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  AiMessage,
  AiConversation as PrismaConversation,
} from '@prisma/client';
import { Transform } from 'class-transformer';

export class AiConversationWithMessagesEntity implements PrismaConversation {
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

  constructor(partial: Partial<AiConversationWithMessagesEntity>) {
    Object.assign(this, partial);
  }
}

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
