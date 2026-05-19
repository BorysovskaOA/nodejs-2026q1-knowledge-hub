import { ApiSchema } from '@nestjs/swagger';
import { MonitoringStatsByEndpoint } from './index.interface';

@ApiSchema({ name: 'AiMonitoringResponse' })
export class AiMonitoringEntity {
  uptime: number;
  totalRequests: number;
  totalTokensForGeneration: number;
  totalTokensForEmbeddings: number;
  breakdown: Record<string, MonitoringStatsByEndpoint>;

  constructor(partial: Partial<AiMonitoringEntity>) {
    Object.assign(this, partial);
  }
}
