import { IsOptional, IsString } from 'class-validator';

export class ChatListFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
