import {
  Body,
  Controller,
  Get,
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
import { Throttle } from '@nestjs/throttler';
import { AiArticleCacheInterceptor } from './ai-article-cache.interceptor';
import { AiMonitoringEntity } from './models/ai-monitoring.entity';
import { Authorize } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';
import { CacheTTL } from '@nestjs/cache-manager';

@ApiBearerAuth('accessToken')
@Controller('ai')
@Throttle({
  default: {
    limit: Number(process.env.RATE_LIMIT_AI),
    ttl: Number(process.env.RATE_LIMIT_TTL),
  },
})
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('articles/:articleId/summarize')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(Number(process.env.AI_CACHE_TTL_SEC))
  @UseInterceptors(AiArticleCacheInterceptor)
  @ApiOkResponse({ type: SummarizeArticleEntity })
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  @ApiServiceUnavailableResponse(GeneralExceptionResponse(503))
  async summarizeArticle(
    @Param() { articleId }: ArticleIdParamDto,
    @Body() summarizeArticleDto: SummarizeArticleDto,
  ): Promise<SummarizeArticleEntity> {
    return this.aiService.summarizeArticle(articleId, summarizeArticleDto);
  }

  @Post('articles/:articleId/translate')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(Number(process.env.AI_CACHE_TTL_SEC))
  @UseInterceptors(AiArticleCacheInterceptor)
  @ApiOkResponse({ type: TranslateArticleEntity })
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  @ApiServiceUnavailableResponse(GeneralExceptionResponse(503))
  async translateArticle(
    @Param() { articleId }: ArticleIdParamDto,
    @Body() translateArticleDto: TranslateArticleDto,
  ): Promise<TranslateArticleEntity> {
    return this.aiService.translateArticle(articleId, translateArticleDto);
  }

  @Post('articles/:articleId/analyze')
  @HttpCode(HttpStatus.OK)
  @CacheTTL(Number(process.env.AI_CACHE_TTL_SEC))
  @UseInterceptors(AiArticleCacheInterceptor)
  @ApiOkResponse({ type: AnalyzeArticleEntity })
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  @ApiServiceUnavailableResponse(GeneralExceptionResponse(503))
  async analyzeArticle(
    @Param() { articleId }: ArticleIdParamDto,
    @Body() analyzeArticleDto: AnalyzeArticleDto,
  ): Promise<AnalyzeArticleEntity> {
    return this.aiService.analyzeArticle(articleId, analyzeArticleDto);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GenerateEntity })
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  @ApiServiceUnavailableResponse(GeneralExceptionResponse(503))
  async generate(@Body() generateDto: GenerateDto): Promise<GenerateEntity> {
    return this.aiService.generate(generateDto);
  }

  @Get('stats')
  @Authorize([{ roles: [UserRole.admin] }])
  @ApiOkResponse({ type: AiMonitoringEntity })
  @ApiUnauthorizedResponse(GeneralExceptionResponse(403))
  getStats(): AiMonitoringEntity {
    return this.aiService.getStats();
  }
}
