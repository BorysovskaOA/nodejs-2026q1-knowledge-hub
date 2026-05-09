import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
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
import { AuthenticatedRequest } from 'src/core/interfaces/authenticated-request.interface';
import { RagChatService } from './rag.chat.service';
import { RagChatEntity } from './models/chat.entity';
import { RagChatDto } from './models/chat.dto';
import { RagConversationHistoryEntity } from './models/conversation-history.entity';
import { LatencyInterceptor } from '../../ai.latency.interceptor';
import { AiConversationEntity } from './models/ai.conversation.entity';
import { ChatListFilterDto } from './models/chat-list-filter.dto';
import { Authorize } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';
import { IdParamDto } from 'src/core/dtos/id-param.dto';

@ApiBearerAuth('accessToken')
@Controller('ai/rag/chat')
@ApiBadRequestResponse(ExtendedExceptionResponse(400))
@ApiUnauthorizedResponse(GeneralExceptionResponse(401))
@ApiInternalServerErrorResponse(GeneralExceptionResponse(500))
export class RagChatController {
  constructor(private ragChatService: RagChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(LatencyInterceptor)
  @ApiOkResponse({ type: RagChatEntity })
  async chat(
    @Req() { user }: AuthenticatedRequest,
    @Body() chatDto: RagChatDto,
  ): Promise<RagChatEntity> {
    return this.ragChatService.chat(user, chatDto);
  }

  @Get()
  @Authorize([
    { roles: [UserRole.admin] },
    {
      roles: [UserRole.editor, UserRole.viewer],
      constraints: { queryPropertyName: 'userId' },
    },
  ])
  @ApiOkResponse({ type: AiConversationEntity })
  async getAllChats(
    @Req() { user }: AuthenticatedRequest,
    @Query() filter: ChatListFilterDto,
  ): Promise<AiConversationEntity[]> {
    return this.ragChatService.getAllChats({
      ...filter,
      userId: filter.userId || user.id,
    });
  }

  @Post(':conversationId/history')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: RagConversationHistoryEntity })
  async getChatHistory(
    @Param() { id }: IdParamDto,
  ): Promise<RagConversationHistoryEntity> {
    return this.ragChatService.getChatHistory(id);
  }
}
