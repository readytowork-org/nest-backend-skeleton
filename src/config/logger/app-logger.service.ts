/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import * as fs from 'fs';
import { envVars } from '../env/env.validation';
import 'winston-daily-rotate-file';
/**
 * Super simple logger implementation - no need to provide context
 */
@Injectable()
export class AppLogger implements LoggerService {
  private logger: Logger;
  private context: string;
  constructor() {
    const printFormat = format.combine(
      format.printf((info) => {
        const { level, message, timestamp, context, ...meta } = info;
        const ctx = context || this.context || 'App';
        const ctxStr = typeof ctx === 'string' ? ctx : 'App';
        const msg = String(message);
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${String(timestamp)} [${String(level)}] [${ctxStr}]: ${msg} ${metaStr}`;
      }),
    );

    const logTransports: any[] = [
      new transports.Console({
        format: format.combine(format.colorize({ all: true }), printFormat),
      }),
    ];

    if (
      envVars.ENVIRONMENT == 'local' ||
      envVars.ENVIRONMENT == 'development'
    ) {
      if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
      }

      const fileFormat = format.combine(format.uncolorize(), printFormat);

      logTransports.push(
        new transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          level: 'error',
          maxFiles: '14d',
          maxSize: '20m',
          handleExceptions: true,
          handleRejections: true,
          format: fileFormat,
        }),
        new transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          level: 'info',
          maxFiles: '14d',
          maxSize: '20m',
          handleExceptions: true,
          handleRejections: true,
          format: fileFormat,
        }),
      );
    }
    // initialize the logger with Winston
    this.logger = createLogger({
      level: envVars.ENVIRONMENT === 'production' ? 'info' : 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
      ),
      transports: logTransports,
      exitOnError: false,
    });

    this.logger.on('error', (err) => {
      console.error('Winston internal error:', err.message, err.stack);
    });

    // Set a default context based on the class name that's using this logger
    this.context = this.getClassContext();
  }

  // Static method to create a logger for main.ts
  static forRoot(appName: string): LoggerService {
    const logTransports: any[] = [
      new transports.Console({
        format: format.combine(format.colorize({ all: true })),
      }),
    ];

    if (
      envVars.ENVIRONMENT == 'local' ||
      envVars.ENVIRONMENT == 'development'
    ) {
      // Create logs directory if it doesn't exist
      if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
      }
      logTransports.push(
        new transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: '14d',
          maxSize: '20m',
          handleExceptions: true,
          handleRejections: true,
          level: 'error',
        }),
        new transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: '14d',
          maxSize: '20m',
          handleExceptions: true,
          handleRejections: true,
          level: 'info',
        }),
      );
    }

    const logger = createLogger({
      level: envVars.ENVIRONMENT === 'production' ? 'info' : 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info) => {
          const { level, message, timestamp } = info;
          return `${String(timestamp)} [${String(level)}] [${appName}]: ${String(message)}`;
        }),
      ),
      transports: logTransports,
      exitOnError: false,
    });

    return {
      log(message: any) {
        logger.info(String(message));
      },
      error(message: any, trace?: string) {
        logger.error(String(message), { trace });
      },
      warn(message: any) {
        logger.warn(String(message));
      },
      debug(message: any) {
        logger.debug(String(message));
      },
      verbose(message: any) {
        logger.verbose(String(message));
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setLogLevels(_levels: string[]) {
        // Not needed for this implementation
      },
    };
  }

  // Method to set context if needed
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  log(message: any, context?: string): void {
    this.logger.info(String(message), { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(String(message), {
      trace,
      context: context || this.context,
    });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(String(message), { context: context || this.context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(String(message), { context: context || this.context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(String(message), { context: context || this.context });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setLogLevels(_levels: string[]): void {
    // Required by NestJS LoggerService interface but not needed for Winston
  }

  // Try to detect the class name that's using this logger
  private getClassContext(): string {
    const stack = new Error().stack;
    if (stack) {
      // Look for constructor calls in the stack trace
      const stackLines = stack.split('\n');
      for (const line of stackLines) {
        if (
          line.includes('new') &&
          line.match(/[A-Z][a-zA-Z]+(?:Service|Controller|Module)/)
        ) {
          const matches = line.match(/new\s+([A-Z][a-zA-Z]+)/);
          if (matches && matches[1]) {
            return matches[1];
          }
        }
      }
    }
    return 'App';
  }
}
