import { Injectable } from '@nestjs/common';
import { ArticleService } from 'src/article/article.service';
import { GeminiService } from 'src/gemini/gemini.service';
import { SummarizeArticleDto } from '../article/models/summarize-arcticle.dto';
import { TranslateArticleDto } from '../article/models/translate-article.dto';
import { TranslateArticleEntity } from '../article/models/translate-article.entity';
import { AnalyzeArticleDto } from '../article/models/analyze-article.dto';
import { AnalyzeArticleEntity } from '../article/models/analyze-article.entity';
import { SummarizeArticleEntity } from '../article/models/summarize-article.entity';
import { generateSummarizeArticlePrompt } from './prompts/summarize-article.prompt';
import {
  generateTranslateArticlePrompt,
  getTranslateArticleResponseSchema,
} from './prompts/translate-article.promt';
import {
  generateAnalizeArticlePrompt,
  getAnalyzeArticleResponseSchema,
} from './prompts/analyze-article.prompt';
import { AiMonitoringService } from '../monitoring/ai.monitoring.service';

@Injectable()
export class AiArticleService {
  constructor(
    private geminiService: GeminiService,
    private articleService: ArticleService,
    private aiMonitoingService: AiMonitoringService,
  ) {}

  async summarize(articleId: string, data: SummarizeArticleDto) {
    const article = await this.articleService.getById(articleId);

    const { response, tokensUsed } = await this.geminiService.ask(
      generateSummarizeArticlePrompt({
        content: article.content,
        summaryLength: data.maxLength,
      }),
    );

    this.aiMonitoingService.trackTokensUsed('summarize', tokensUsed);

    return new SummarizeArticleEntity({
      articleId: article.id,
      summary: response,
      originalLength: article.content.length,
      summaryLength: response?.length,
    });
  }

  async translate(articleId: string, data: TranslateArticleDto) {
    const article = await this.articleService.getById(articleId);

    const { response, tokensUsed } = await this.geminiService.ask(
      generateTranslateArticlePrompt({
        ...data,
        content: article.content,
      }),
      {
        responseMimeType: 'application/json',
        responseSchema: getTranslateArticleResponseSchema(data.targetLanguage),
      },
    );

    this.aiMonitoingService.trackTokensUsed('translate', tokensUsed);

    return new TranslateArticleEntity({
      articleId: article.id,
      ...response,
    });
  }

  async analyze(articleId: string, data: AnalyzeArticleDto) {
    const article = await this.articleService.getById(articleId);

    const { response, tokensUsed } = await this.geminiService.ask(
      generateAnalizeArticlePrompt({
        ...data,
        content: article.content,
      }),
      {
        responseMimeType: 'application/json',
        responseSchema: getAnalyzeArticleResponseSchema(),
      },
    );

    this.aiMonitoingService.trackTokensUsed('analyze', tokensUsed);

    return new AnalyzeArticleEntity({
      articleId: article.id,
      ...response,
    });
  }
}
