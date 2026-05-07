import { Module } from '@nestjs/common';
import { AiMonitoringService } from './ai.monitoring.service';

@Module({
  providers: [AiMonitoringService],
  exports: [AiMonitoringService],
})
export class AiMonitoringModule {}
