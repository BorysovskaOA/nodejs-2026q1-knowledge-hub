import { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

export function setupProcessErrorHandler(app: INestApplication) {
  const logger = app.get(Logger);

  const gracefulShutdown = async (error: Error, type: string) => {
    logger.fatal({
      msg: `Process terminated due to ${type}`,
      error: error?.message || error,
      stack: error?.stack,
    });

    try {
      await app.close();
      process.exit(1);
    } catch (err) {
      process.stderr.write(`Error during shutdown: ${err}\n`);
      process.exit(1);
    }
  };

  process.on('uncaughtException', (err) =>
    gracefulShutdown(err, 'uncaughtException'),
  );
  process.on('unhandledRejection', (reason: any) =>
    gracefulShutdown(reason, 'unhandledRejection'),
  );

  process.on('SIGTERM', () =>
    gracefulShutdown(new Error('SIGTERM received'), 'SIGTERM'),
  );
}
