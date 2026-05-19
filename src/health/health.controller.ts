import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { PublicRote } from 'src/core/decorators/public-route.decorator';
import { HealthService } from './health.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @HealthCheck()
  @PublicRote()
  @ApiOperation({ summary: 'Checks whether app is healthy' })
  check() {
    return this.healthService.check();
  }
}
