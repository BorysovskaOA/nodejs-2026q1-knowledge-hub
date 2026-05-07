import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { GenerateDto } from './models/generate.dto';
import { GenerateEntity } from './models/generate.entity';
import { Throttle } from '@nestjs/throttler';
import { AiMonitoringEntity } from './models/ai-monitoring.entity';
import { Authorize } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';

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
