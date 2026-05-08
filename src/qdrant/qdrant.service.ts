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

  async ensureCollectionExists(collection: string, vectorSize: number) {
    const response = await this.client.getCollections();
    const exists = response.collections.some((c) => c.name === collection);

    if (!exists) {
      this.logger.debug({ collection, created: true }, 'Collection');
      await this.client.createCollection(collection, {
        vectors: { size: vectorSize, distance: 'Cosine' },
      });
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
    limit: number = 3,
    filter: Schemas['Filter'],
  ) {
    this.logger.debug({ collection, filter, limit }, 'Search');
    return this.callWithErrorHandling(
      this.client.search(collection, {
        vector,
        limit,
        filter,
        with_payload: true,
      }),
    );
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
