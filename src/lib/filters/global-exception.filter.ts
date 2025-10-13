import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorCode } from '@app/common';
import { RequestLogger } from '@app/utils/request-logger.util';
import { ErrorResponseException } from '@app/lib/api_response/error_response';
import { AppLogger } from '@app/config/logger/app-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  private readonly HTTP_ERROR_CODES = {
    400: ApiErrorCode.BadRequest,
    401: ApiErrorCode.Unauthorized,
    403: ApiErrorCode.Forbidden,
    404: ApiErrorCode.NotFound,
    409: ApiErrorCode.Conflict,
  };

  private readonly DB_ERROR_PATTERNS = {
    duplicate: {
      patterns: ['ER_DUP_ENTRY', 'duplicate key value'],
      response: {
        statusCode: 409,

        errorCode: ApiErrorCode.DuplicateEntry,
        message: 'Record already exists',
      },
    },
    foreignKey: {
      patterns: ['ER_NO_REFERENCED_ROW', 'violates foreign key constraint'],
      response: {
        statusCode: 400,
        errorCode: ApiErrorCode.BadRequest,
        message: 'Referenced record not found',
      },
    },
    referenced: {
      patterns: ['ER_ROW_IS_REFERENCED'],
      response: {
        statusCode: 409,
        errorCode: ApiErrorCode.Conflict,
        message: 'Cannot delete record with dependencies',
      },
    },
    connection: {
      patterns: ['connection', 'timeout'],
      response: {
        statusCode: 503,
        errorCode: ApiErrorCode.Unavailable,
        message: 'Database connection error',
      },
    },
  };

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Set request start time if not set
    if (!request['startTime']) {
      request['startTime'] = Date.now();
    }

    const statusCode = this.getHttpStatus(exception);
    const stackTrace = (exception as Error).stack;
    console.error(`Stack Trace: ${stackTrace}`);
    RequestLogger.logError(this.logger, request, exception, statusCode);

    const errorResponse = this.buildErrorResponse(exception, request);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return 500;
  }

  private buildErrorResponse(exception: unknown, request: Request) {
    const baseResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Handle ErrorResponseException directly to preserve error codes
    if (this.isErrorResponseException(exception)) {
      const response = exception.getResponse() as any;
      return {
        ...baseResponse,
        statusCode: exception.getStatus(),
        errorCode: response.errorCode,
        message: response.message,
        errors: response.errors,
        ...(response?.data ? { data: response.data } : {}),
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse() as any;

      if (status === 400 && response?.message) {
        return this.handleValidationError(response, baseResponse);
      }

      return {
        ...baseResponse,
        statusCode: status,
        errorCode: this.HTTP_ERROR_CODES[status] || ApiErrorCode.HttpError,
        message: exception.message,
      };
    }

    if (this.isDatabaseError(exception)) {
      const dbError = this.handleDatabaseError(exception as Error);
      return {
        ...baseResponse,
        ...dbError,
      };
    }

    return {
      ...baseResponse,
      statusCode: 500,
      errorCode: ApiErrorCode.InternalServerError,
      message: 'Internal server error',
    };
  }

  private handleValidationError(response: any, baseResponse: any) {
    if (Array.isArray(response.message)) {
      return {
        ...baseResponse,
        statusCode: 400,
        errorCode: ApiErrorCode.ValidationError,
        message: 'Validation failed',
        errors: response.message,
      };
    }

    if (typeof response.message === 'string') {
      if (
        response.message.includes('JSON') ||
        response.message.includes('Unexpected token')
      ) {
        return {
          ...baseResponse,
          statusCode: 400,
          errorCode: ApiErrorCode.BadRequest,
          message: 'Invalid JSON format in request body',
        };
      }

      if (this.isValidationMessage(response.message)) {
        return {
          ...baseResponse,
          statusCode: 400,
          errorCode: ApiErrorCode.ValidationError,
          message: 'Validation failed',
          errors: [response.message],
        };
      }
    }

    return {
      ...baseResponse,
      statusCode: 400,
      errorCode: ApiErrorCode.BadRequest,
      message: response.message,
    };
  }

  private handleDatabaseError(error: Error) {
    const message = error.message.toLowerCase();

    for (const [, pattern] of Object.entries(this.DB_ERROR_PATTERNS)) {
      if (pattern.patterns.some((p) => message.includes(p.toLowerCase()))) {
        return pattern.response;
      }
    }

    return {
      statusCode: 500,
      errorCode: ApiErrorCode.DatabaseError,
      message: 'Database error',
    };
  }

  private isDatabaseError(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;
    const message = exception.message.toLowerCase();
    const name = exception.name?.toLowerCase() || '';

    return (
      ['er_', 'duplicate', 'foreign key', 'constraint', 'database'].some(
        (term) => message.includes(term) || name.includes(term),
      ) ||
      ['sequelize', 'typeorm', 'prisma', 'drizzle'].some((orm) =>
        name.includes(orm),
      )
    );
  }

  private isValidationMessage(message: string): boolean {
    return ['must be', 'should be', 'is required', 'valid'].some((term) =>
      message.includes(term),
    );
  }

  private isErrorResponseException(
    exception: unknown,
  ): exception is ErrorResponseException {
    return exception instanceof ErrorResponseException;
  }
}
