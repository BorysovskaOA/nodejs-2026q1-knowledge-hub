import { Injectable } from '@nestjs/common';
import { AiMonitoringEntity } from './models/ai-monitoring.entity';
import { MonitoringStatsByEndpoint } from './models/index.interface';

const initialEndPointStats: MonitoringStatsByEndpoint = {
  requests: 0,
  cacheHit: 0,
  cacheMiss: 0,
  cacheHitRatio: 0,
  avgLatencyHit: 0,
  avgLatencyMiss: 0,
  tokens: 0,
};

@Injectable()
export class AiMonitorService {
  private totalRequests = 0;
  private totalTokens = 0;
  private breakdown: Record<string, MonitoringStatsByEndpoint> = {};

  track(endpoint: string, isCached: boolean, latency: number) {
    this.totalRequests++;
    const endpointStats = this.breakdown[endpoint] || initialEndPointStats;

    console.log(isCached);

    this.breakdown[endpoint] = isCached
      ? formatUpdatedHit(endpointStats, latency)
      : formatUpdatedMiss(endpointStats, latency);
  }

  trackTokensUsed(endpoint: string, tokens: number) {
    if (!tokens) return;

    this.totalTokens += tokens;

    const endpointStats = this.breakdown[endpoint] || initialEndPointStats;

    this.breakdown[endpoint] = {
      ...endpointStats,
      tokens: endpointStats.tokens + tokens,
    };
  }

  getStats() {
    return new AiMonitoringEntity({
      uptime: process.uptime(),
      totalRequests: this.totalRequests,
      totalTokens: this.totalTokens,
      breakdown: this.breakdown,
    });
  }
}

function formatLatency(avgLatency: number, avgCount: number, latency: number) {
  if (!avgCount) return latency;

  return +((avgLatency * (avgCount - 1) + latency) / avgCount).toFixed(3);
}

function formatUpdatedHit(
  actual: MonitoringStatsByEndpoint,
  latency: number,
): MonitoringStatsByEndpoint {
  const requests = actual.requests + 1;
  const hits = actual.cacheHit + 1;

  return {
    ...actual,
    requests,
    cacheHit: hits,
    cacheHitRatio: +(hits / requests).toFixed(3),
    avgLatencyHit: formatLatency(
      actual.avgLatencyHit,
      actual.cacheHit,
      latency,
    ),
  };
}

function formatUpdatedMiss(
  actual: MonitoringStatsByEndpoint,
  latency: number,
): MonitoringStatsByEndpoint {
  const requests = actual.requests + 1;

  return {
    ...actual,
    requests,
    cacheMiss: actual.cacheMiss + 1,
    cacheHitRatio: actual.cacheHit
      ? +(actual.cacheHit / requests).toFixed(3)
      : 0,
    avgLatencyMiss: formatLatency(
      actual.avgLatencyMiss,
      actual.avgLatencyMiss,
      latency,
    ),
  };
}
