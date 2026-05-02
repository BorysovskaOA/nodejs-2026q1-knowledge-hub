import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'AiMonitoringResponse' })
export class AiMonitoringEntity {
  uptime: number;
  totalRequests: number;
  totalTokens: number;
  breakdown: Record<string, number>;

  constructor(partial: Partial<AiMonitoringEntity>) {
    Object.assign(this, partial);
  }
}
