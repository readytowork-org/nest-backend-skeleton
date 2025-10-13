import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { RequestLogger } from '@app/utils/request-logger.util';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new AppLogger().setContext('HTTP');
  // private readonly EXCLUDED_PATHS = ['/health'];

  use(req: Request, res: Response, next: NextFunction): void {
    req['startTime'] = Date.now();
    res.on(
      'finish',
      () =>
        res.statusCode < 400 &&
        RequestLogger.logSuccess(this.logger, req, res.statusCode),
    );
    next();
  }
}
