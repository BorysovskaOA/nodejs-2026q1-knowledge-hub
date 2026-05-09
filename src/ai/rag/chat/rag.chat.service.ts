import { AiMessageRole } from '@prisma/client';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { GeminiService } from 'src/gemini/gemini.service';
import { UserEntity } from 'src/user/models/user.entity';
import {
  InternalServerError,
  NotFoundError,
} from 'src/core/exceptions/app-errors';
import { AiMonitoringService } from '../../monitoring/ai.monitoring.service';
import { ArticleVectorPayload } from '../models/article-vector-payload.interface';
import { RagChatDto } from './models/chat.dto';
import { RagChatEntity } from './models/chat.entity';
import { RagConversationHistoryEntity } from './models/conversation-history.entity';
import { ChatListFilterDto } from './models/chat-list-filter.dto';
import { AiConversationWithMessagesEntity } from './models/ai.conversation.entity';
import { AiConversationRepository } from './ai-conversation.repository';
import {
  generateCreateConversationPrompt,
  getCreateConversationResponseSchema,
} from './prompts/create-chat.promtp';
import { generateReformatQuestionPrompt } from './prompts/reformat-question';
import { generateAnswerUsingContextPrompt } from './prompts/answer-using-context.prompt';
import { getAnswerChatQuestionInstruction } from './prompts/answer-question.instruction';

const CHAT_VECTORS_LIMIT = 5;
const CHAT_VECTORS_SCORE_THRESHOLD = 0.75;
const MAX_MESSAGES_IN_CHAT = Number(
  process.env.RAG_CONVERSATION_MAX_MESSAGES as string,
);

@Injectable()
export class RagChatService implements OnModuleInit {
  private collection: string;
  private logger: Logger;

  constructor(
    private geminiService: GeminiService,
    private qdrantService: QdrantService,
    private aiConversationRepository: AiConversationRepository,
    private aiMonitorService: AiMonitoringService,
  ) {
    this.collection = process.env.RAG_VECTOR_COLLECTION as string;
    this.logger = new Logger('DATABASE');
  }

  async onModuleInit() {
    const vectorSize = this.geminiService.getEmbeddingsModelVectorSize();
    await this.qdrantService.ensureCollectionExists(
      this.collection,
      vectorSize,
    );
  }

  async getAllChats(filter: ChatListFilterDto) {
    return await this.aiConversationRepository.findAll(filter);
  }

  async chat(user: UserEntity, chatDto: RagChatDto) {
    if (!chatDto.conversationId)
      return this.createNewConversation(user.id, chatDto.question);
    return this.addNewQuestionToConversation(
      chatDto.conversationId,
      chatDto.question,
    );
  }

  async getChatHistory(conversationId: string) {
    const messages =
      await this.aiConversationRepository.findAllConversationMessages(
        conversationId,
      );
    return new RagConversationHistoryEntity({
      history: messages,
    });
  }

  private async createNewConversation(userId: string, question: string) {
    const similarVectors = await this.getSimilarVectorsForChat(question);

    const { response, tokensUsed } = await this.geminiService.ask(
      generateCreateConversationPrompt(
        question,
        similarVectors.map((v) => {
          const payload = v.payload as unknown as ArticleVectorPayload;
          return payload.content;
        }),
      ),
      {
        responseMimeType: 'application/json',
        responseSchema: getCreateConversationResponseSchema(),
        systemInstruction: getAnswerChatQuestionInstruction(),
      },
    );

    this.aiMonitorService.trackTokensUsedForContentGeneration(
      'ai/rag/chat [NEW]',
      tokensUsed,
    );

    const conversation =
      await this.aiConversationRepository.createConversationWithInitialMessages(
        {
          title: response.title,
          userId,
        },
        [
          { role: AiMessageRole.user, content: question },
          { role: AiMessageRole.model, content: response.answer },
        ],
      );

    return new RagChatEntity({
      conversationId: conversation.id,
      answer: response.answer,
      sources: similarVectors.map((v) => {
        const payload = v.payload as unknown as ArticleVectorPayload;

        return {
          articleId: payload.articleId,
          articleTitle: payload.title,
          relevantChunk: payload.content,
        };
      }),
    });
  }

  private async addNewQuestionToConversation(
    conversationId: string,
    question: string,
  ) {
    const conversation =
      await this.aiConversationRepository.findConversationWithMessages(
        conversationId,
        MAX_MESSAGES_IN_CHAT,
      );

    if (!conversation)
      throw new NotFoundError(
        `Conversation ${conversationId} is not found`,
        RagChatService.name,
      );

    const similarVectors = await this.getVectorsForQuestionInConversation(
      question,
      conversation,
    );

    const history = this.getConversationHistoryForGeneration(conversation);

    const questionWithContext = generateAnswerUsingContextPrompt(
      question,
      similarVectors.map((v) => {
        const payload = v.payload as unknown as ArticleVectorPayload;
        return payload.content;
      }),
    );

    const { response, tokensUsed } = await this.geminiService.askWithHistory(
      [...history, this.geminiService.formatTextPart(questionWithContext)],
      {
        systemInstruction: getAnswerChatQuestionInstruction(),
      },
    );

    this.aiMonitorService.trackTokensUsedForContentGeneration(
      'ai/rag/chat',
      tokensUsed,
    );

    const updatedConversation =
      await this.aiConversationRepository.addMessagesToConversation(
        conversation.id,
        [
          { role: AiMessageRole.user, content: question },
          { role: AiMessageRole.model, content: response },
        ],
      );

    return new RagChatEntity({
      conversationId: updatedConversation.id,
      answer: response,
      sources: similarVectors.map((v) => {
        const payload = v.payload as unknown as ArticleVectorPayload;

        return {
          articleId: payload.articleId,
          articleTitle: payload.title,
          relevantChunk: payload.content,
        };
      }),
    });
  }

  private async getVectorsForQuestionInConversation(
    question: string,
    conversation: AiConversationWithMessagesEntity,
  ) {
    const history = this.getConversationHistoryForGeneration(conversation);

    const { response: reformattedQuestionBasedOnHistory, tokensUsed } =
      await this.geminiService.askWithHistory([
        ...history,
        this.geminiService.formatTextPart(
          generateReformatQuestionPrompt(question),
        ),
      ]);

    this.aiMonitorService.trackTokensUsedForContentGeneration(
      'ai/rag/chat',
      tokensUsed,
    );

    return this.getSimilarVectorsForChat(
      reformattedQuestionBasedOnHistory as string,
    );
  }

  private async getSimilarVectorsForChat(question: string) {
    const questionVector = await this.geminiService.getEmbedding(question);

    return this.qdrantService.searchSimilar(this.collection, questionVector, {
      limit: CHAT_VECTORS_LIMIT,
      scoreThreshold: CHAT_VECTORS_SCORE_THRESHOLD,
    });
  }

  private getConversationHistoryForGeneration(
    conversation: AiConversationWithMessagesEntity,
  ) {
    const history = conversation.messages.map((m) =>
      this.geminiService.formatTextPart(m.content, m.role),
    );

    if (history[0].role === AiMessageRole.user) {
      return history;
    }

    const firstUserMessageIndex = history.findIndex(
      (hi) => hi.role === AiMessageRole.user,
    );

    // history should start by user message
    if (firstUserMessageIndex === -1)
      throw new InternalServerError(
        { conversationId: conversation.id, updatedAt: conversation.updatedAt },
        `Last ${MAX_MESSAGES_IN_CHAT} messages in conversation ${conversation.id} does not have user messages`,
      );

    return history.slice(firstUserMessageIndex);
  }
}
