import { Injectable } from '@nestjs/common';
import { AiMonitoringEntity } from './models/ai-monitoring.entity';

@Injectable()
export class AiMonitorService {
  private totalRequests = 0;
  private requestsByMethod: Record<string, number> = {};
  private totalTokens = 0;

  track(method: string, tokens?: number) {
    this.totalRequests++;

    this.requestsByMethod[method] = (this.requestsByMethod[method] || 0) + 1;

    if (tokens) {
      this.totalTokens += tokens;
    }
  }

  getStats() {
    return new AiMonitoringEntity({
      uptime: process.uptime(),
      totalRequests: this.totalRequests,
      totalTokens: this.totalTokens,
      breakdown: this.requestsByMethod,
    });
  }
}
