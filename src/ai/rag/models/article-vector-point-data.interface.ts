import { ArticleVectorPayload } from './article-vector-payload.interface';

export interface ArticleVectorPointData {
  id: string;
  vector: number[];
  payload: ArticleVectorPayload;
}
