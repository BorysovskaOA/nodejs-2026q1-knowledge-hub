import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AiConversation,
  AiMessage,
  AiMessageRole,
  Prisma,
} from '@prisma/client';
import {
  AiConversationEntity,
  AiConversationWithMessagesEntity,
} from './models/ai.conversation.entity';
import { AiMessageEntity } from './models/message.entity';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { ChatListFilterDto } from './models/chat-list-filter.dto';

export type AiConversationWithAiMessages = Prisma.AiConversationGetPayload<{
  include: { aiMessages: true };
}>;

@Injectable()
export class AiConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private dbConversation(tx?: Prisma.TransactionClient) {
    return (tx || this.prisma).aiConversation;
  }

  private dbMessage(tx?: Prisma.TransactionClient) {
    return (tx || this.prisma).aiMessage;
  }

  private mapConversationWithMessages(
    data: AiConversationWithAiMessages,
  ): AiConversationWithMessagesEntity {
    const messages = data.aiMessages.map(this.mapMessage);
    return new AiConversationWithMessagesEntity({
      ...data,
      messages,
    });
  }

  private mapConversation(data: AiConversation): AiConversationEntity {
    return new AiConversationEntity(data);
  }

  private mapMessage(data: AiMessage): AiMessageEntity {
    return new AiMessageEntity(data);
  }

  async findAll(filter: ChatListFilterDto, tx?: Prisma.TransactionClient) {
    const items = await this.dbConversation(tx).findMany({
      where: filter,
      orderBy: [{ updatedAt: SortOrder.DESC }],
    });

    return items.map(this.mapConversation);
  }

  async findAllConversationMessages(
    aiConversationId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<AiMessageEntity[]> {
    const items = await this.dbMessage(tx).findMany({
      where: { aiConversationId },
    });

    return items.map(this.mapMessage);
  }

  async findConversationWithMessages(
    id: string,
    aiMessagesLimit?: number,
    tx?: Prisma.TransactionClient,
  ): Promise<AiConversationWithMessagesEntity | null> {
    const item = await this.dbConversation(tx).findUnique({
      where: { id },
      include: {
        aiMessages: {
          take: aiMessagesLimit,
          orderBy: [{ createdAt: SortOrder.DESC }, { role: SortOrder.DESC }],
        },
      },
    });

    if (!item) return null;

    // To have proper history
    if (item.aiMessages) {
      item.aiMessages.reverse();
    }

    return this.mapConversationWithMessages(item);
  }

  async createConversationWithInitialMessages(
    aiConversationData: { title: string; userId: string },
    aiMessagesData: { role: AiMessageRole; content: string }[],
    tx?: Prisma.TransactionClient,
  ): Promise<AiConversationWithMessagesEntity> {
    const item = await this.dbConversation(tx).create({
      data: {
        ...aiConversationData,
        aiMessages: {
          create: aiMessagesData,
        },
      },
      include: {
        aiMessages: true,
      },
    });

    return this.mapConversationWithMessages(item);
  }

  async updateConversation(
    aiConversationId: string,
    aiConversationData: Partial<AiConversation>,
    tx?: Prisma.TransactionClient,
  ): Promise<AiConversationWithMessagesEntity> {
    const item = await this.dbConversation(tx).update({
      where: { id: aiConversationId },
      data: {
        ...aiConversationData,
        updatedAt: new Date(),
      },
      include: {
        aiMessages: true,
      },
    });

    return this.mapConversationWithMessages(item);
  }

  async addMessagesToConversation(
    aiConversationId: string,
    aiMessagesData: { role: AiMessageRole; content: string }[],
    tx?: Prisma.TransactionClient,
  ): Promise<AiConversationWithMessagesEntity> {
    const item = await this.dbConversation(tx).update({
      where: { id: aiConversationId },
      data: {
        updatedAt: new Date(),
        aiMessages: {
          create: aiMessagesData,
        },
      },
      include: {
        aiMessages: true,
      },
    });

    return this.mapConversationWithMessages(item);
  }

  async deleteConversation(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<AiConversationWithMessagesEntity> {
    const item = await this.dbConversation(tx).delete({
      where: { id },
      include: { aiMessages: true },
    });

    return this.mapConversationWithMessages(item);
  }
}
