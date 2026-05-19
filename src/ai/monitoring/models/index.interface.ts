export interface MonitoringStatsByEndpoint {
  requests: number;
  cacheHit: number;
  cacheHitRatio: number;
  cacheMiss: number;
  avgLatencyHit: number;
  avgLatencyMiss: number;
  tokens: number;
}
