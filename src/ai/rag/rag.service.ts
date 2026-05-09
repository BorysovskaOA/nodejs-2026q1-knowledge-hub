import { randomUUID } from 'node:crypto';
import { ArticleStatus } from '@prisma/client';
import { ArticleEntity } from 'src/article/models/article.entity';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { ArticleService } from 'src/article/article.service';
import { GeminiService } from 'src/gemini/gemini.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RagIndexDto } from './models/index.dto';
import { RagIndexEntity } from './models/index.entity';
import { RagSearchDto } from './models/search.dto';
import { RagSearchEntity } from './models/search.entity';
import { ArticleVectorPayload } from './models/article-vector-payload.interface';
import { splitArticleIntoChunks } from './utils/split-article-into-chucks.util';

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

    const chucnks = articles
      .map((a) => this.getArticleChunksWithVectorMetadata(a))
      .flat();

    const results = await this.batchProcessChunks(chucnks);

    return new RagIndexEntity({
      vectorCollection: this.collection,
      indexedArticles: results.articles.size,
      indexedChunks: results.chunks,
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

  private async batchProcessChunks(chunks: ArticleVectorPayload[]) {
    const batchParts = Math.ceil(chunks.length / BATCH_SIZE);
    const processedResults = {
      articles: new Set(),
      chunks: 0,
      failedArticles: new Set(),
    };

    // Work with batches to not reduce number of requests at once
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      try {
        const vectors = await this.geminiService.getBatchEmbeddings(
          batch.map((c) => c.content),
        );

        const batchPoints = batch.map((chunk, index) => ({
          id: randomUUID(),
          vector: vectors[index],
          payload: chunk,
        }));

        await this.qdrantService.upsertPoints(this.collection, batchPoints);

        processedResults.chunks += batch.length;
        batch.forEach((c) => processedResults.articles.add(c.articleId));

        this.logger.debug(
          { batchPart: i + 1, totalBatchParts: batchParts },
          'Embedding vector created for',
        );
      } catch (error) {
        batch.forEach((c) => processedResults.failedArticles.add(c.articleId));
        break;
      }
    }

    return processedResults;
  }

  private getArticleChunksWithVectorMetadata(
    article: ArticleEntity,
  ): ArticleVectorPayload[] {
    const chunks = splitArticleIntoChunks(
      article.content,
      Number(process.env.RAG_CHUNK_SIZE as string),
      Number(process.env.RAG_CHUNK_OVERLAP as string),
    );

    return chunks.map((chunk, index) => ({
      articleId: article.id,
      title: article.title,
      status: article.status,
      categoryId: article.categoryId,
      tags: article.tags,
      content: chunk,
      chunkIndex: index,
    }));
  }
}
