import {
  Body,
  Controller,
  Delete,
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
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ExtendedExceptionResponse,
  GeneralExceptionResponse,
} from 'src/core/utils/exception-responses.util';
import { RagService } from './rag.service';
import { RagIndexEntity } from './models/index.entity';
import { RagIndexDto } from './models/index.dto';
import { RagSearchDto } from './models/search.dto';
import { RagSearchEntity } from './models/search.entity';
import { LatencyInterceptor } from '../ai.latency.interceptor';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import {
  MAX_ARTICLES_TO_INDEX_ONCE,
  ARTICLE_BATCH_SIZE,
} from './models/constants';

@ApiBearerAuth('accessToken')
@Controller('ai/rag')
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
export class RagController {
  constructor(private ragService: RagService) {}

  @Post('index')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(LatencyInterceptor)
  @ApiOperation({
    summary: 'Adds articles information to internal knowledge base.',
    description: `Allows to process up to ${MAX_ARTICLES_TO_INDEX_ONCE} articles at once. Works in batches by ${ARTICLE_BATCH_SIZE} articles.`,
  })
  @ApiOkResponse({ type: RagIndexEntity })
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  @ApiServiceUnavailableResponse(GeneralExceptionResponse(503))
  async index(@Body() indexDto: RagIndexDto): Promise<RagIndexEntity> {
    return this.ragService.index(indexDto);
  }

  @Delete('index/article/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Removes article information from internal knowledge base.',
  })
  async deleteArticleIndex(@Param() { id }: IdParamDto) {
    this.ragService.deleteArticleIndex(id);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(LatencyInterceptor)
  @ApiOperation({
    summary:
      'Search for pieces of info for provided query in internal knowledge base with relevance ranking.',
  })
  @ApiOkResponse({ type: RagSearchEntity })
  async search(@Body() searchDto: RagSearchDto): Promise<RagSearchEntity> {
    return this.ragService.search(searchDto);
  }
}
