import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { PublicRote } from 'src/core/decorators/public-route.decorator';
import { HealthService } from './health.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller({
  path: 'health',
  version: VERSION_NEUTRAL
})
export class HealthController {
  constructor(private healthService: HealthService) { }

  @Get()
  @HealthCheck()
  @PublicRote()
  @ApiOperation({ summary: 'Checks whether app is healthy' })
  check() {
    return this.healthService.check();
  }
}
