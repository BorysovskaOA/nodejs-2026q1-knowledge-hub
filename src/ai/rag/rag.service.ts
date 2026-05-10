import { randomUUID } from 'node:crypto';
import { ArticleStatus, Prisma } from '@prisma/client';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { ArticleService } from 'src/article/article.service';
import { GeminiService } from 'src/gemini/gemini.service';
import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { RagIndexDto } from './models/index.dto';
import { RagIndexEntity } from './models/index.entity';
import { RagSearchDto } from './models/search.dto';
import { RagSearchEntity } from './models/search.entity';
import { ArticleVectorPayload } from './models/article-vector-payload.interface';
import { splitArticleInChunksWithPayload } from './utils/split-article-into-chucks.util';
import {
  InternalServerError,
  NotFoundError,
} from 'src/core/exceptions/app-errors';
import { PrismaService } from 'src/prisma/prisma.service';
import { ArticleVectorPointData } from './models/article-vector-point-data.interface';

const ARTICLE_BATCH_SIZE = 5;
const MAX_ARTICLES_TO_INDEX_ONCE = 100;

@Injectable()
export class RagService implements OnModuleInit {
  private collection: string;
  private logger: Logger;
  constructor(
    private geminiService: GeminiService,
    private qdrantService: QdrantService,
    @Inject(forwardRef(() => ArticleService))
    private articleService: ArticleService,
    private readonly prisma: PrismaService,
  ) {
    this.collection = process.env.RAG_VECTOR_COLLECTION as string;
    this.logger = new Logger('RAG_SERVICE');
  }

  async onModuleInit() {
    const vectorSize = this.geminiService.getEmbeddingsModelVectorSize();
    await this.qdrantService.ensureCollectionExists(
      this.collection,
      vectorSize,
    );
  }

  async index(indexDto: RagIndexDto) {
    const articlesFilter = {
      ...(indexDto.onlyPublished ? { status: ArticleStatus.published } : {}),
      ...(indexDto.articleIds?.length > 0
        ? { id: { in: indexDto.articleIds } }
        : {}),
    };

    const results = await this.indexInBatches(articlesFilter);

    return new RagIndexEntity({
      vectorCollection: this.collection,
      ...results,
    });
  }

  // Work with batches to reduce number of requests at once
  private async indexInBatches(
    articlesFilter: Prisma.ArticleWhereInput,
    tx?: Prisma.TransactionClient,
  ) {
    const processedResults = {
      articles: new Set(),
      chunks: 0,
    };

    const completeWhere = {
      ...articlesFilter,
      isIndexed: false,
    };

    const count = await this.articleService.count(completeWhere);

    const toProcess = Math.min(count, MAX_ARTICLES_TO_INDEX_ONCE);
    const batchParts = Math.ceil(toProcess / ARTICLE_BATCH_SIZE);

    for (let i = 0; i < batchParts; i += 1) {
      const points: ArticleVectorPointData[] = [];

      try {
        if (tx) {
          await this.processSingleBatch(completeWhere, i, points, tx);
        } else {
          await this.prisma.$transaction(async (internalTx) =>
            this.processSingleBatch(completeWhere, i, points, internalTx),
          );

          processedResults.chunks += points.length;
          points.forEach((c) =>
            processedResults.articles.add(c.payload.articleId),
          );

          this.logger.debug(
            { batchPart: i + 1, totalBatchParts: batchParts },
            'Indexed batch',
          );
        }
      } catch (err) {
        if (points.length) {
          const pointIds = points.map((p) => p.id);
          try {
            await this.qdrantService.deletePoints(this.collection, pointIds);
          } catch (e) {
            this.logger.warn(
              { service: RagService.name, pointIds, error: e.message },
              `Failed to cleanup`,
            );
          }
        }

        throw new InternalServerError(`Failed to index articles`, {
          service: RagService.name,
          error: err.message,
        });
      }
    }

    return {
      indexedArticles: processedResults.articles.size,
      indexedChunks: processedResults.chunks,
    };
  }

  private async processSingleBatch(
    where: Prisma.ArticleWhereInput,
    part: number,
    points: ArticleVectorPointData[],
    tx: Prisma.TransactionClient,
  ) {
    const articles = await this.articleService.getMany(
      {
        where: where,
        take: ARTICLE_BATCH_SIZE,
        skip: part * ARTICLE_BATCH_SIZE,
      },
      tx,
    );

    if (!articles.length) return;

    const chunks = articles
      .map((a) => splitArticleInChunksWithPayload(a))
      .flat();
    const vectors = await this.geminiService.getBatchEmbeddings(
      chunks.map((c) => c.content),
    );

    chunks.forEach((chunk, index) => {
      points.push({
        id: randomUUID(),
        vector: vectors[index],
        payload: chunk,
      });
    });

    await this.qdrantService.upsertPoints(this.collection, points);

    await this.articleService.updateMany(
      articles.map((a) => a.id),
      { isIndexed: true },
      tx,
    );
  }

  private async validateArticleIndexExist(articleId: string) {
    const value = await this.qdrantService.countVectors(
      this.collection,
      'articleId',
      articleId,
    );

    return !!value;
  }

  // Reindex only if were indexed before
  async reindexArticle(articleId: string, tx?: Prisma.TransactionClient) {
    const exist = this.validateArticleIndexExist(articleId);
    if (!exist) return;

    await this.qdrantService.deleteIndexes(
      this.collection,
      'articleId',
      articleId,
    );

    await this.indexInBatches({ id: articleId }, tx);
  }

  async deleteArticleIndex(articleId: string, silent: boolean = false) {
    try {
      const exist = this.validateArticleIndexExist(articleId);

      if (!exist) {
        throw new NotFoundError(
          `Index for article ${articleId} is not found`,
          RagService.name,
        );
      }

      return this.qdrantService.deleteIndexes(
        this.collection,
        'articleId',
        articleId,
      );
    } catch (error) {
      this.logger.warn({ articleId, error }, 'Failed remove article index');
      if (silent) return;

      throw error;
    }
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
}
