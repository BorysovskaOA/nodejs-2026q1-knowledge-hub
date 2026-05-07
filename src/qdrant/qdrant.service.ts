import { HttpStatus, Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import {
  InternalServerError,
  ServiceUnavailableError,
} from 'src/core/exceptions/app-errors';

@Injectable()
export class QdrantService {
  private client: QdrantClient;

  constructor() {
    this.client = new QdrantClient({ url: process.env.RAG_VECTOR_DB_URL });
  }

  async ensureCollectionExists(name: string, vectorSize: number) {
    const response = await this.client.getCollections();
    const exists = response.collections.some((c) => c.name === name);

    if (!exists) {
      await this.client.createCollection(name, {
        vectors: { size: vectorSize, distance: 'Cosine' },
      });
    }
  }

  async upsertPoints(collection: string, points: any[]) {
    return this.callWithErrorHandling(
      this.client.upsert(collection, {
        wait: true,
        points,
      }),
    );
  }

  async searchSimilar(collection: string, vector: number[], limit: number = 3) {
    return this.callWithErrorHandling(
      this.client.search(collection, {
        vector,
        limit,
        with_payload: true,
      }),
    );
  }

  async deleteIndexes(
    collection: string,
    metadataKey: string,
    metadataValue: any,
  ) {
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
