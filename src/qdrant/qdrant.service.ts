import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import {
  InternalServerError,
  ServiceUnavailableError,
} from 'src/core/exceptions/app-errors';
import type { Schemas } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService {
  private client: QdrantClient;
  private logger: Logger;

  constructor() {
    this.client = new QdrantClient({ url: process.env.RAG_VECTOR_DB_URL });
    this.logger = new Logger('QDRANT');
  }

  async getCollections() {
    return this.callWithErrorHandling(this.client.getCollections());
  }

  async ensureCollectionExists(collection: string, vectorSize: number) {
    const response = await this.client.getCollections();
    const exists = response.collections.some((c) => c.name === collection);

    if (!exists) {
      this.logger.debug({ collection, created: true }, 'Collection');
      await this.callWithErrorHandling(
        this.client.createCollection(collection, {
          vectors: { size: vectorSize, distance: 'Cosine' },
        }),
      );
    }
    this.logger.debug({ collection }, 'Collection');
  }

  async upsertPoints(collection: string, points: any[]) {
    this.logger.debug({ collection, pointsLength: points.length }, 'Indexing');
    return this.callWithErrorHandling(
      this.client.upsert(collection, {
        wait: true,
        points,
      }),
    );
  }

  async searchSimilar(
    collection: string,
    vector: number[],
    searchOptions: {
      limit?: number;
      filter?: Schemas['Filter'];
      scoreThreshold?: number;
    } = {},
  ) {
    this.logger.debug({ collection, searchOptions }, 'Search');
    const result = await this.callWithErrorHandling(
      this.client.search(collection, {
        vector,
        with_payload: true,
        ...{
          limit: searchOptions.limit,
          filter: searchOptions.filter,
          score_threshold: searchOptions.scoreThreshold,
        },
      }),
    );

    return result;
  }

  async countVectors(
    collection: string,
    metadataKey: string,
    metadataValue: any,
  ) {
    this.logger.debug(
      { collection, metadataKey, metadataValue },
      'Count vectors',
    );
    const result = await this.callWithErrorHandling(
      this.client.count(collection, {
        filter: {
          must: [{ key: metadataKey, match: { value: metadataValue } }],
        },
      }),
    );
    return result.count;
  }

  async scanVectors(collection: string, filter: Schemas['Filter']) {
    this.logger.debug({ collection, filter }, 'Scan');
    const result = await this.callWithErrorHandling(
      this.client.scroll(collection, {
        filter,
        with_payload: true,
        with_vector: false,
      }),
    );
    return result.points;
  }

  async deleteIndexes(
    collection: string,
    metadataKey: string,
    metadataValue: any,
  ) {
    this.logger.debug(
      { collection, metadataKey, metadataValue },
      'Deleting index',
    );
    return this.callWithErrorHandling(
      this.client.delete(collection, {
        filter: {
          must: [{ key: metadataKey, match: { value: metadataValue } }],
        },
      }),
    );
  }

  async deletePoints(collection: string, pointsToDelete: string[]) {
    this.logger.debug({ collection, pointsToDelete }, 'Deleting points');
    return this.callWithErrorHandling(
      this.client.delete(collection, {
        points: pointsToDelete,
      }),
    );
  }

  async callWithErrorHandling<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (err) {
      if (!err.status || err.status === HttpStatus.SERVICE_UNAVAILABLE) {
        throw new ServiceUnavailableError(
          'Vector db service is not available',
          {
            service: QdrantService.name,
            error: err.message,
            details: err?.data,
          },
        );
      }

      throw new InternalServerError('Failed to manipulate data in vector db', {
        service: QdrantService.name,
        error: err.message,
        details: err?.data,
      });
    }
  }
}
