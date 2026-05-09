import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'RagChatBody' })
export class RagChatDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
