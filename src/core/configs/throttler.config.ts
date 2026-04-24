export const throttlerConfig = [
  {
    ttl: Number(process.env.RATE_LIMIT_TTL),
    limit: Number(process.env.RATE_LIMIT),
  },
];
