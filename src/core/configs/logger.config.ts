import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env.config';

export const getPinoConfig = (
  configService: ConfigService<EnvironmentVariables, true>
): Params => ({
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
    level: configService.get('LOG_LEVEL'),
    transport: {
      targets: [
        {
          target:
            configService.get('NODE_ENV') !== 'production' ? 'pino-pretty' : 'pino/file',
          level: configService.get('LOG_LEVEL'),
          options:
            configService.get('NODE_ENV') !== 'production'
              ? {
                colorize: true,
                singleLine: true,
                translateTime: 'SYS:standard',
              }
              : undefined,
        },
        {
          target: 'pino-roll',
          level: configService.get('LOG_LEVEL'),
          options: {
            file: 'logs/app',
            extension: '.log',
            dateFormat: "yyyy-MM-dd'T'HH-mm-ss",
            frequency: 'daily',
            size: `${configService.get('LOG_MAX_FILE_SIZE')}k`,
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
});;
