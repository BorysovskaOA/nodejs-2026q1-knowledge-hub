import { ApiSchema } from '@nestjs/swagger';
import { AnalyzeSeverity } from './constants';

@ApiSchema({ name: 'AnalyzeArticleResponse' })
export class AnalyzeArticleEntity {
  articleId: string;
  analysis: string;
  suggestions: string[];
  severity: AnalyzeSeverity;

  constructor(partial: Partial<AnalyzeArticleEntity>) {
    Object.assign(this, partial);
  }
}
