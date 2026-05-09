import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ExtendedExceptionResponse,
  GeneralExceptionResponse,
} from 'src/core/utils/exception-responses.util';
import { SummarizeArticleDto } from './models/summarize-arcticle.dto';
import { SummarizeArticleEntity } from './models/summarize-article.entity';
import { TranslateArticleDto } from './models/translate-article.dto';
import { TranslateArticleEntity } from './models/translate-article.entity';
import { AnalyzeArticleDto } from './models/analyze-article.dto';
import { AnalyzeArticleEntity } from './models/analyze-article.entity';
import { Throttle } from '@nestjs/throttler';
import { AiArticleCacheInterceptor } from './ai.article.cache.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';
import { AiArticleService } from './ai.article.service';
import { IdParamDto } from 'src/core/dtos/id-param.dto';

@ApiBearerAuth('accessToken')
@Controller('ai/article/:id')
@Throttle({
  default: {
    limit: Number(process.env.RATE_LIMIT_AI),
    ttl: Number(process.env.RATE_LIMIT_TTL),
  },
})
@CacheTTL(Number(process.env.AI_CACHE_TTL_SEC))
@UseInterceptors(AiArticleCacheInterceptor)
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
@ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
@ApiServiceUnavailableResponse(GeneralExceptionResponse(503))
export class AiArticleController {
  constructor(private aiArticleService: AiArticleService) {}

  @Post('summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SummarizeArticleEntity })
  async summarizeArticle(
    @Param() { id }: IdParamDto,
    @Body() summarizeArticleDto: SummarizeArticleDto,
  ): Promise<SummarizeArticleEntity> {
    return this.aiArticleService.summarize(id, summarizeArticleDto);
  }

  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TranslateArticleEntity })
  async translateArticle(
    @Param() { id }: IdParamDto,
    @Body() translateArticleDto: TranslateArticleDto,
  ): Promise<TranslateArticleEntity> {
    return this.aiArticleService.translate(id, translateArticleDto);
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AnalyzeArticleEntity })
  async analyzeArticle(
    @Param() { id }: IdParamDto,
    @Body() analyzeArticleDto: AnalyzeArticleDto,
  ): Promise<AnalyzeArticleEntity> {
    return this.aiArticleService.analyze(id, analyzeArticleDto);
  }
}
