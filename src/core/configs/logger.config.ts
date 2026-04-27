import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const nestToPinoLevel = (level: string) => {
  const map = {
    log: 'info',
    debug: 'debug',
    warn: 'warn',
    error: 'error',
    verbose: 'trace',
  };
  return map[level] || 'info';
};

export const pinoConfig: Params = {
  pinoHttp: {
    redact: {
      paths: [
        'req.headers.authorization',
        'req.body.password',
        'req.body.oldPassword',
        'req.body.newPassword',
        'req.raw.body.password',
        'password',
        'passwordHash',
        '*.password',
        '*.*.password',
        '*.passwordHash',
        '*.*.passwordHash',
        'accessToken',
        'refreshToken',
        '*.accessToken',
        '*.refreshToken',
        '*.*.accessToken',
        '*.*.refreshToken',
      ],
      censor: '[REDACTED]',
    },
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.raw.body || req.body,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        responseTime: res.responseTime,
      }),
    },
    genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
    level: nestToPinoLevel(process.env.LOG_LEVEL as string),
    transport: {
      targets: [
        {
          target:
            process.env.NODE_ENV !== 'production' ? 'pino-pretty' : 'pino/file',
          level: nestToPinoLevel(process.env.LOG_LEVEL as string),
          options:
            process.env.NODE_ENV !== 'production'
              ? {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                }
              : undefined,
        },
        {
          target: 'pino-roll',
          level: nestToPinoLevel(process.env.LOG_LEVEL as string),
          options: {
            file: 'logs/app',
            extension: '.log',
            dateFormat: "yyyy-MM-dd'T'HH-mm-ss",
            frequency: 'daily',
            size: `${process.env.LOG_MAX_FILE_SIZE}k`,
            mkdir: true,
            rollOnStart: false,
            limit: {
              count: 7,
            },
          },
        },
      ],
    },
    customSuccessMessage: (req, res, time) => {
      return `Completed: ${req.method} | ${req.url} | ${res.statusCode} | ${time}ms`;
    },
    customLogLevel: (req, res) => {
      const time = (res as any).elapsedTime;

      if (res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';

      if (time >= 2000) return 'warn';

      return 'info';
    },
  },
};
