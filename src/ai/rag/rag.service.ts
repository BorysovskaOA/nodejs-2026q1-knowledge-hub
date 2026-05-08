import { randomUUID } from 'node:crypto';
import { GeminiService } from 'src/gemini/gemini.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RagIndexDto } from './models/index.dto';
import { RagIndexEntity } from './models/index.entity';
import { RagSearchDto } from './models/search.dto';
import { RagSearchEntity } from './models/search.entity';
import { RagChatDto } from './models/chat.dto';
import { RagChatEntity } from './models/chat.entity';
import { RagConversationHistoryEntity } from './models/conversation-history.entity';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { ArticleService } from 'src/article/article.service';
import { ArticleStatus } from '@prisma/client';
import { ArticleEntity } from 'src/article/models/article.entity';
import { splitArticleIntoChunks } from './utils/split-article-into-chucks.util';
import { InternalServerError } from 'src/core/exceptions/app-errors';
import { ArticleVectorPayload } from './models/article-vector-payload.interface';

const BATCH_SIZE = 10;

@Injectable()
export class RagService implements OnModuleInit {
  private collection: string;
  private logger: Logger;
  constructor(
    private geminiService: GeminiService,
    private qdrantService: QdrantService,
    private articleService: ArticleService,
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
      searchDto.limit,
      filter,
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

  async chat(chatDto: RagChatDto) {
    return new RagChatEntity({});
  }

  async deleteArticleIndex(articleId: string) {
    return this.qdrantService.deleteIndexes(
      this.collection,
      'articleId',
      articleId,
    );
  }

  async getChatConversationHistory(conversationId: string) {
    return new RagConversationHistoryEntity({});
  }

  private async indexArticle(article: ArticleEntity) {
    const chunks = splitArticleIntoChunks(
      article.content,
      Number(process.env.RAG_CHUNK_SIZE as string),
      Number(process.env.RAG_CHUNK_OVERLAP as string),
    );
    const points: any[] = [];

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
}
