import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { AiService } from './ai.service';
import { GenerateDto } from './models/generate.dto';
import { GenerateEntity } from './models/generate.entity';
import { Throttle } from '@nestjs/throttler';
import { AiMonitoringEntity } from './monitoring/models/ai-monitoring.entity';
import { Authorize } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';
import { AiMonitoringService } from './monitoring/ai.monitoring.service';
import { LatencyInterceptor } from './ai.latency.interceptor';

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
  constructor(
    private aiService: AiService,
    private aiMonitoringService: AiMonitoringService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(LatencyInterceptor)
  @ApiOperation({ summary: 'General endpoint to ask AI' })
  @ApiOkResponse({ type: GenerateEntity })
  @ApiTooManyRequestsResponse(GeneralExceptionResponse(429))
  @ApiServiceUnavailableResponse(GeneralExceptionResponse(503))
  async generate(@Body() generateDto: GenerateDto): Promise<GenerateEntity> {
    return this.aiService.generate(generateDto);
  }

  @Get('stats')
  @Authorize([{ roles: [UserRole.admin] }])
  @ApiOperation({
    summary: 'Provides statistic of caching, latency and usage of AI APIs',
  })
  @ApiOkResponse({ type: AiMonitoringEntity })
  @ApiUnauthorizedResponse(GeneralExceptionResponse(403))
  getStats(): AiMonitoringEntity {
    return this.aiMonitoringService.getStats();
  }
}
