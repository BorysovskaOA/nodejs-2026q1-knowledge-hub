import { ArticleService } from 'src/article/article.service';
import { Injectable } from '@nestjs/common';
import { SummarizeArticleDto } from './models/summarize-arcticle.dto';
import { TranslateArticleDto } from './models/translate-article.dto';
import { TranslateArticleEntity } from './models/translate-article.entity';
import { AnalyzeArticleDto } from './models/analyze-article.dto';
import { AnalyzeArticleEntity } from './models/analyze-article.entity';
import { GenerateDto } from './models/generate.dto';
import { GenerateEntity } from './models/generate.entity';
import { SummarizeArticleEntity } from './models/summarize-article.entity';
import { GeminiService } from 'src/gemini/gemini.service';
import { generateSummarizeArticlePrompt } from './prompts/summarize-article.prompt';
import { generateTranslatePrompt } from './prompts/translate-article.promt';

@Injectable()
export class AiService {
  constructor(
    private geminiService: GeminiService,
    private articleService: ArticleService,
  ) {}

  async summarizeArticle(articleId: string, data: SummarizeArticleDto) {
    const article = await this.articleService.getById(articleId);

    const response = await this.geminiService.ask(
      generateSummarizeArticlePrompt({
        content: article.content,
        summaryLength: data.maxLength,
      }),
    );

    return new SummarizeArticleEntity({
      articleId: article.id,
      summary: response,
      originalLength: article.content.length,
      summaryLength: response?.length,
    });
  }

  async translateArticle(articleId: string, data: TranslateArticleDto) {
    const article = await this.articleService.getById(articleId);

    const response = await this.geminiService.ask(
      generateTranslatePrompt({
        ...data,
        content: article.content,
      }),
      {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            detectedLanguage: {
              type: 'string',
              description: 'Detected language name in Title Case',
            },
            translatedText: {
              type: 'string',
              description: `Tranlsated content in  ${data.targetLanguage}`,
            },
          },
          required: ['detectedLanguage', 'translatedText'],
        },
      },
    );

    return new TranslateArticleEntity({
      articleId: article.id,
      ...response,
    });
  }

  async analyzeArticle(articleId: string, data: AnalyzeArticleDto) {
    const article = await this.articleService.getById(articleId);

    return new AnalyzeArticleEntity({
      articleId: article.id,
    });
  }

  async generate(data: GenerateDto) {
    const response = await this.geminiService.ask(data.prompt);

    return new GenerateEntity({ content: response });
  }
}
