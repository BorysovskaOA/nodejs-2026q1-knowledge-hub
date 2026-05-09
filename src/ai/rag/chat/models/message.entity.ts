import { ApiHideProperty, ApiProperty, ApiSchema } from '@nestjs/swagger';
import { AiMessageRole, AiMessage as PrismaMessage } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';

@ApiSchema({ name: 'Message' })
export class AiMessageEntity implements PrismaMessage {
  id: string;
  role: AiMessageRole;
  content: string;

  @ApiHideProperty()
  @Exclude()
  aiConversationId: string;

  @ApiProperty()
  get conversationId(): string {
    return this.aiConversationId;
  }

  @ApiProperty({ type: 'number' })
  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  constructor(partial: Partial<AiMessageEntity>) {
    Object.assign(this, partial);
  }
}
