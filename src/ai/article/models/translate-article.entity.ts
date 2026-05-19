import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'TranslateArticleResponse' })
export class TranslateArticleEntity {
  articleId: string;
  translatedText: string;
  detectedLanguage: string;

  constructor(partial: Partial<TranslateArticleEntity>) {
    Object.assign(this, partial);
  }
}
