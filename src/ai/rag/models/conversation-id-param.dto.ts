import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConversationIdParamDto {
  @IsNotEmpty()
  @IsUUID()
  conversationId: string;
}
