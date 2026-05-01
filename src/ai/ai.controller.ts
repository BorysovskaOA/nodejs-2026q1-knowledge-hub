import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ExtendedExceptionResponse,
  GeneralExceptionResponse,
} from 'src/core/utils/exception-responses.util';
import { AiService } from './ai.service';
import { SummarizeArticleDto } from './models/summarize-arcticle.dto';
import { ArticleIdParamDto } from './models/article-id-param.dto';
import { SummarizeArticleEntity } from './models/summarize-article.entity';
import { TranslateArticleDto } from './models/translate-article.dto';
import { TranslateArticleEntity } from './models/translate-article.entity';
import { AnalyzeArticleDto } from './models/analyze-article.dto';
import { AnalyzeArticleEntity } from './models/analyze-article.entity';
import { GenerateDto } from './models/generate.dto';
import { GenerateEntity } from './models/generate.entity';
import { CustomThrottlerGuard } from 'src/core/guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';

@ApiBearerAuth('accessToken')
@Controller('ai')
@UseGuards(CustomThrottlerGuard)
@Throttle({
  default: {
    limit: Number(process.env.AI_RATE_LIMIT_RPM),
    ttl: Number(process.env.AI_CACHE_TTL_SEC),
  },
})
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('articles/:articleId/summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SummarizeArticleEntity })
  async summarizeArticle(
    @Param() { articleId }: ArticleIdParamDto,
    @Body() summarizeArticleDto: SummarizeArticleDto,
  ): Promise<SummarizeArticleEntity> {
    return this.aiService.summarizeArticle(articleId, summarizeArticleDto);
  }

  @Post('articles/:articleId/translate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TranslateArticleEntity })
  async translateArticle(
    @Param() { articleId }: ArticleIdParamDto,
    @Body() translateArticleDto: TranslateArticleDto,
  ): Promise<TranslateArticleEntity> {
    return this.aiService.translateArticle(articleId, translateArticleDto);
  }

  @Post('articles/:articleId/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AnalyzeArticleEntity })
  async analyzeArticle(
    @Param() { articleId }: ArticleIdParamDto,
    @Body() analyzeArticleDto: AnalyzeArticleDto,
  ): Promise<AnalyzeArticleEntity> {
    return this.aiService.analyzeArticle(articleId, analyzeArticleDto);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GenerateEntity })
  async generate(@Body() generateDto: GenerateDto): Promise<GenerateEntity> {
    return this.aiService.generate(generateDto);
  }
}
