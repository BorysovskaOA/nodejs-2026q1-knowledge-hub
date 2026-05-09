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
  @ApiOkResponse({ type: RagIndexEntity })
  async index(@Body() indexDto: RagIndexDto): Promise<RagIndexEntity> {
    return this.ragService.index(indexDto);
  }

  @Delete('index/article/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArticleIndex(@Param() { id }: IdParamDto) {
    this.ragService.deleteArticleIndex(id);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(LatencyInterceptor)
  @ApiOkResponse({ type: RagSearchEntity })
  async search(@Body() searchDto: RagSearchDto): Promise<RagSearchEntity> {
    return this.ragService.search(searchDto);
  }
}
