import { Request } from 'express';

interface IRequestLogger {
  log(message: any): void;
  error(message: any): void;
}

interface ErrorContext {
  name: string;
  message: string;
  location: {
    fileName: string;
    lineNumber: string;
  };
}

export class RequestLogger {
  private static readonly EMOJIS = {
    success: '✅',
    redirect: '↩️',
    clientError: '❌',
    serverError: '💥',
    info: '📝',
  };

  private static readonly FILE_PATTERNS = [
    /at\s+(?:.+?\s+\()?(.+?\.[tj]s):(\d+)(?::\d+\))?/,
  ];

  private static formatLogMessage(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    id = Math.random().toString(36).substr(2, 6).toUpperCase(),
    errorContext?: ErrorContext,
  ): string {
    const emoji =
      statusCode >= 500
        ? this.EMOJIS.serverError
        : statusCode >= 400
          ? this.EMOJIS.clientError
          : statusCode >= 300
            ? this.EMOJIS.redirect
            : statusCode >= 200
              ? this.EMOJIS.success
              : this.EMOJIS.info;

    const base = `${emoji} [${id}] ${method} ${url} ${statusCode} (${duration}ms)`;
    return errorContext
      ? `${base} - ${errorContext.name}: ${errorContext.message} at ${errorContext.location.fileName}:${errorContext.location.lineNumber}`
      : base;
  }

  private static getErrorLocation(stack?: string, url?: string) {
    if (!stack) return this.inferLocationFromUrl(url);

    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('node_modules')) continue;

      const match = this.FILE_PATTERNS[0].exec(line);
      if (match) {
        const fileName = match[1].split('/').pop() || match[1];
        if (
          !['main.ts', 'bootstrap', 'platform'].some((f) =>
            fileName.includes(f),
          )
        ) {
          return { fileName, lineNumber: match[2] };
        }
      }
    }

    return this.inferLocationFromUrl(url);
  }

  private static inferLocationFromUrl(url?: string) {
    if (!url)
      return { fileName: 'request.handler.ts', lineNumber: 'processing' };

    const moduleMatch = url.match(/\/api\/v\d+\/(\w+)/);
    return moduleMatch
      ? { fileName: `${moduleMatch[1]}.dto.ts`, lineNumber: 'validation' }
      : { fileName: 'request.handler.ts', lineNumber: 'processing' };
  }

  private static buildErrorContext(
    error: Error,
    location: ErrorContext['location'],
    statusCode: number,
  ): ErrorContext {
    let message = error.message;
    let finalLocation = location;

    if (error.name === 'BadRequestException' && statusCode === 400) {
      const response = (error as any).response?.message;

      if (response) {
        if (Array.isArray(response)) {
          message = `Validation failed: ${response.join(', ')}`;
        } else if (typeof response === 'string') {
          if (
            ['must be', 'valid', 'required', 'should be'].some((k) =>
              response.includes(k),
            )
          ) {
            message = `Validation error: ${response}`;
          } else if (
            ['JSON', 'Unexpected token'].some((k) => response.includes(k))
          ) {
            message = 'Invalid JSON format in request body';
            finalLocation = {
              fileName: 'express.middleware.ts',
              lineNumber: 'json-parse',
            };
          }
        }
      }
    }

    return { name: error.name, message, location: finalLocation };
  }

  static logSuccess(
    logger: IRequestLogger,
    request: Request,
    statusCode: number,
  ): void {
    const duration = Date.now() - (request['startTime'] || Date.now());
    logger.log(
      this.formatLogMessage(request.method, request.url, statusCode, duration),
    );
  }

  static logError(
    logger: IRequestLogger,
    request: Request,
    exception: unknown,
    statusCode: number,
  ): void {
    const duration = Date.now() - (request['startTime'] || Date.now());

    if (!(exception instanceof Error)) {
      logger.error(
        this.formatLogMessage(
          request.method,
          request.url,
          statusCode,
          duration,
        ) + ` - Unknown error: ${String(exception)}`,
      );
      return;
    }

    const location = this.getErrorLocation(exception.stack, request.url);
    const errorContext = this.buildErrorContext(
      exception,
      location,
      statusCode,
    );
    logger.error(
      this.formatLogMessage(
        request.method,
        request.url,
        statusCode,
        duration,
        undefined,
        errorContext,
      ),
    );
  }
}
