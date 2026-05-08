import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AiConversation,
  AiMessage,
  AiMessageRole,
  Prisma,
} from '@prisma/client';
import { AiConversationEntity } from './models/ai.conversation.entity';
import { AiMessageEntity } from './models/message.entity';
import { SortOrder } from 'src/core/dtos/sorting.dto';

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
  ): AiConversationEntity {
    const messages = data.aiMessages.map(this.mapMessage);
    return new AiConversationEntity({
      ...data,
      messages,
    });
  }

  private mapMessage(data: AiMessage): AiMessageEntity {
    return new AiMessageEntity(data);
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

  async findConversation(
    id: string,
    aiMessagesLimit?: number,
    tx?: Prisma.TransactionClient,
  ): Promise<AiConversationEntity | null> {
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
  ): Promise<AiConversationEntity> {
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
  ): Promise<AiConversationEntity> {
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
  ): Promise<AiConversationEntity> {
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
  ): Promise<AiConversationEntity> {
    const item = await this.dbConversation(tx).delete({
      where: { id },
      include: { aiMessages: true },
    });

    return this.mapConversationWithMessages(item);
  }
}
