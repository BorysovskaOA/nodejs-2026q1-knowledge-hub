import { ApiSchema } from '@nestjs/swagger';
import { MonitoringStatsByEndpoint } from './index.interface';

@ApiSchema({ name: 'AiMonitoringResponse' })
export class AiMonitoringEntity {
  uptime: number;
  totalRequests: number;
  totalTokens: number;
  breakdown: Record<string, MonitoringStatsByEndpoint>;

  constructor(partial: Partial<AiMonitoringEntity>) {
    Object.assign(this, partial);
  }
}
