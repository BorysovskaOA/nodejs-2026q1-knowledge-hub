import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = new Date();

    res.on('finish', () => {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.info(
        `[${endTime.toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      );
    });
    next();
  }
}
