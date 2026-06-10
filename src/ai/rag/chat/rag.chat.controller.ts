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
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
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
  constructor(private ragChatService: RagChatService) { }

  @Post()
  @Authorize([
    { roles: [UserRole.admin] },
    {
      roles: [UserRole.editor, UserRole.viewer],
      constraints: {
        bodyPropertyName: 'conversationId',
        service: RagChatService,
        userPropertyName: 'userId',
      },
    },
  ])
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(LatencyInterceptor)
  @ApiOperation({
    summary:
      'Creates a new conversation based on internal data or allows to add messages to existing conversation',
    description: `Allows to provide up to {RAG_CONVERSATION_MAX_MESSAGES} messages in one conversation.`,
  })
  @ApiOkResponse({ type: RagChatEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  @ApiConflictResponse(GeneralExceptionResponse(409))
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  @ApiServiceUnavailableResponse(GeneralExceptionResponse(503))
  async chat(
    @Req() { user }: AuthenticatedRequest,
    @Body() chatDto: RagChatDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RagChatEntity> {
    return this.ragChatService.chat(user, chatDto, res);
  }

  @Get()
  @Authorize([
    { roles: [UserRole.admin] },
    {
      roles: [UserRole.editor, UserRole.viewer],
      constraints: { queryPropertyName: 'userId' },
    },
  ])
  @ApiOperation({
    summary: 'Provides a list of all the conversations of the user',
  })
  @ApiOkResponse({ type: AiConversationEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  async getAllChats(
    @Req() { user }: AuthenticatedRequest,
    @Query() filter: ChatListFilterDto,
  ): Promise<AiConversationEntity[]> {
    return this.ragChatService.getAllChats({
      ...filter,
      userId: filter.userId || user.id,
    });
  }

  @Get(':id/history')
  @Authorize([
    { roles: [UserRole.admin] },
    {
      roles: [UserRole.editor, UserRole.viewer],
      constraints: {
        paramName: 'id',
        service: RagChatService,
        userPropertyName: 'userId',
      },
    },
  ])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Provides a list of all the messages in conversation',
  })
  @ApiOkResponse({ type: RagConversationHistoryEntity })
  @ApiForbiddenResponse(GeneralExceptionResponse(403))
  async getChatHistory(
    @Param() { id }: IdParamDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RagConversationHistoryEntity> {
    return this.ragChatService.getChatHistory(id, res);
  }
}
