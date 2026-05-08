import { randomUUID } from 'node:crypto';
import { ArticleStatus, AiMessageRole } from '@prisma/client';
import { ArticleEntity } from 'src/article/models/article.entity';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { ArticleService } from 'src/article/article.service';
import { GeminiService } from 'src/gemini/gemini.service';
import { UserEntity } from 'src/user/models/user.entity';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RagIndexDto } from './models/index.dto';
import { RagIndexEntity } from './models/index.entity';
import { RagSearchDto } from './models/search.dto';
import { RagSearchEntity } from './models/search.entity';
import { RagChatDto } from './models/chat.dto';
import { RagChatEntity } from './models/chat.entity';
import { RagConversationHistoryEntity } from './models/conversation-history.entity';
import { splitArticleIntoChunks } from './utils/split-article-into-chucks.util';
import {
  InternalServerError,
  NotFoundError,
} from 'src/core/exceptions/app-errors';
import { ArticleVectorPayload } from './models/article-vector-payload.interface';
import { AiConversationRepository } from './ai-conversation.repository';
import {
  generateCreateConversationPrompt,
  getCreateConversationResponseSchema,
} from './prompts/create-chat.promtp';
import { generateReformatQuestionPrompt } from './prompts/reformat-question';
import { generateAnswerUsingContextPrompt } from './prompts/answer-using-context.prompt';
import { AiConversationEntity } from './models/ai.conversation.entity';
import { AiMonitoringService } from '../monitoring/ai.monitoring.service';

const BATCH_SIZE = 10;
const CHAT_VECTORS_LIMIT = 5;
const CHAT_VECTORS_SCORE_THRESHOLD = 0.75;

@Injectable()
export class RagService implements OnModuleInit {
  private collection: string;
  private logger: Logger;
  constructor(
    private geminiService: GeminiService,
    private qdrantService: QdrantService,
    private articleService: ArticleService,
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

  async index(indexDto: RagIndexDto) {
    const articles = await this.articleService.getMany({
      ...(indexDto.onlyPublished ? { status: ArticleStatus.published } : {}),
      ...(indexDto.articleIds?.length > 0
        ? { id: { in: indexDto.articleIds } }
        : {}),
    });

    const results = {
      indexedArticles: 0,
      indexedChunks: 0,
    };

    // Work one by one to not provoke DoS on AI
    for (const article of articles) {
      const res = await this.indexArticle(article);
      results.indexedArticles += 1;
      results.indexedChunks += res.chunksCount;
    }

    return new RagIndexEntity({
      vectorCollection: this.collection,
      ...results,
    });
  }

  async deleteArticleIndex(articleId: string) {
    return this.qdrantService.deleteIndexes(
      this.collection,
      'articleId',
      articleId,
    );
  }

  async search(searchDto: RagSearchDto) {
    const filter: Record<string, any> = {};

    if (searchDto.articleStatus) {
      if (!filter.must) filter.must = [];
      filter.must.push({
        key: 'status',
        match: { value: searchDto.articleStatus },
      });
    }
    if (searchDto.categoryId) {
      if (!filter.must) filter.must = [];
      filter.must.push({
        key: 'categoryId',
        match: { value: searchDto.categoryId },
      });
    }

    if (searchDto.tags) {
      if (!filter.must) filter.must = [];
      filter.must.push({
        key: 'tags',
        match: { any: searchDto.tags },
      });
    }

    const queryVector = await this.geminiService.getEmbedding(searchDto.query);

    const results = await this.qdrantService.searchSimilar(
      this.collection,
      queryVector,
      { limit: searchDto.limit, filter },
    );

    return new RagSearchEntity({
      results: results.map((r) => {
        const payload = r.payload as unknown as ArticleVectorPayload;

        return {
          articleId: payload.articleId,
          articleTitle: payload.title,
          chunk: payload.content,
          similarity: r.score,
        };
      }),
    });
  }

  async chat(user: UserEntity, chatDto: RagChatDto) {
    if (!chatDto.conversationId)
      return this.createNewConversation(user.id, chatDto.question);
    return this.addNewQuestionToConversation(
      chatDto.conversationId,
      chatDto.question,
    );
  }

  async getChatConversationHistory(conversationId: string) {
    const messages =
      await this.aiConversationRepository.findAllConversationMessages(
        conversationId,
      );
    return new RagConversationHistoryEntity({
      history: messages,
    });
  }

  private async indexArticle(article: ArticleEntity) {
    const chunks = splitArticleIntoChunks(
      article.content,
      Number(process.env.RAG_CHUNK_SIZE as string),
      Number(process.env.RAG_CHUNK_OVERLAP as string),
    );
    const points: any[] = [];

    // Work with batches to not provoke DoS on AI
    try {
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);

        const vectors = await this.geminiService.getBatchEmbeddings(batch);

        const batchPoints = batch.map((chunk, index) => {
          const payload: ArticleVectorPayload = {
            articleId: article.id,
            title: article.title,
            status: article.status,
            categoryId: article.categoryId,
            tags: article.tags,
            content: chunk,
            chunkIndex: index,
          };

          return {
            id: randomUUID(),
            vector: vectors[index],
            payload,
          };
        });

        points.push(...batchPoints);

        this.logger.debug(
          { batchPart: i / BATCH_SIZE + 1, pointsLength: points.length },
          'Batch processed',
        );
      }
    } catch (error) {
      throw new InternalServerError(`Failed to index article ${article.id}`, {
        service: RagService.name,
        error: error.message,
      });
    }

    await this.qdrantService.upsertPoints(this.collection, points);

    return { success: true, chunksCount: points.length };
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
      await this.aiConversationRepository.findConversation(conversationId);

    if (!conversation)
      throw new NotFoundError(
        `Conversation ${conversationId} is not found`,
        RagService.name,
      );

    const similarVectors = await this.getVectorsForQuestionInConversation(
      question,
      conversation,
    );

    const history = conversation.messages.map((m) =>
      this.geminiService.formatTextPart(m.content, m.role),
    );

    const questionWithContext = generateAnswerUsingContextPrompt(
      question,
      similarVectors.map((v) => {
        const payload = v.payload as unknown as ArticleVectorPayload;
        return payload.content;
      }),
    );

    const { response, tokensUsed } = await this.geminiService.askWithHistory([
      ...history,
      this.geminiService.formatTextPart(questionWithContext),
    ]);

    this.aiMonitorService.trackTokensUsedForContentGeneration(
      'ai/rag/chat',
      tokensUsed,
    );

    // We need that to contain just up to specific amount of messages.
    const messagesToDelete =
      history.length + 2 >
      Number(process.env.RAG_CONVERSATION_MAX_MESSAGES as string)
        ? [conversation.messages[0].id, conversation.messages[0].id]
        : [];

    const updatedConversation =
      await this.aiConversationRepository.addMessagesToConversation(
        conversation.id,
        [
          { role: AiMessageRole.user, content: question },
          { role: AiMessageRole.model, content: response },
        ],
        messagesToDelete,
      );

    return new RagChatEntity({
      conversationId: updatedConversation.id,
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

  private async getVectorsForQuestionInConversation(
    question: string,
    conversation: AiConversationEntity,
  ) {
    const history = conversation.messages.map((m) =>
      this.geminiService.formatTextPart(m.content, m.role),
    );

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
}
