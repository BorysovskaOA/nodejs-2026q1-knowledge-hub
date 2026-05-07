import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { RagChatEntity } from './models/chat.entity';
import { RagChatDto } from './models/chat.dto';
import { ArticleIdParamDto } from '../models/article-id-param.dto';
import { ConversationIdParamDto } from './models/conversation-id-param.dto';
import { RagConversationHistoryEntity } from './models/conversation-history.entity';

@ApiBearerAuth('accessToken')
@Controller('ai/rag')
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
export class RagController {
  constructor(private ragService: RagService) {}

  @Post('index')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RagIndexEntity })
  async reindex(@Body() reindexDto: RagIndexDto): Promise<RagIndexEntity> {
    return this.ragService.index(reindexDto);
  }

  @Delete('index/article/:articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArticleFromIndex(@Param() { articleId }: ArticleIdParamDto) {
    this.ragService.deleteArticleFromIndex(articleId);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RagSearchEntity })
  async search(@Body() searchDto: RagSearchDto): Promise<RagSearchEntity> {
    return this.ragService.search(searchDto);
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RagChatEntity })
  async chat(@Body() chatDto: RagChatDto): Promise<RagChatEntity> {
    return this.ragService.chat(chatDto);
  }

  @Post('chat/:conversationId/history')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RagConversationHistoryEntity })
  async getChatConversationHistory(
    @Param() { conversationId }: ConversationIdParamDto,
  ): Promise<RagConversationHistoryEntity> {
    return this.ragService.getChatConversationHistory(conversationId);
  }
}
