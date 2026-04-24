import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorCode } from '@app/common';
import { RequestLogger } from '@app/utils/request-logger.util';
import { ErrorResponseException } from '@common/api_response/error_response';
import { AppLogger } from '@config/logger/app-logger.service';
import { IntrinsicException } from '@nestjs/common/exceptions/intrinsic.exception';
import {
  BaseErrorResponse,
  DbErrorPatternMap,
  DbErrorResponse,
  ErrorCodeType,
  ErrorResponsePayload,
  HttpExceptionBody,
} from './exception.types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  private readonly HTTP_ERROR_CODES: Record<number, ApiErrorCode> = {
    400: ApiErrorCode.BadRequest,
    401: ApiErrorCode.Unauthorized,
    403: ApiErrorCode.Forbidden,
    404: ApiErrorCode.NotFound,
    409: ApiErrorCode.Conflict,
  };

  private readonly DB_ERROR_PATTERNS: DbErrorPatternMap = {
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

  catch(
    exception: IntrinsicException | ErrorConstructor | Error,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Set request start time if not set
    if (!request['startTime']) {
      request['startTime'] = Date.now();
    }

    const statusCode = this.getHttpStatus(exception);
    const exceptionError = exception as Error;
    console.error(`Exception Error Cause:`, exceptionError.cause);
    console.error(`Exception Error Stack:: ${exceptionError.stack}`);
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

  private buildErrorResponse(
    exception: IntrinsicException | ErrorConstructor | Error,
    request: Request,
  ): ErrorResponsePayload {
    const baseResponse: BaseErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (this.isDatabaseError(exception)) {
      const dbError = this.handleDatabaseError(exception as Error);
      return {
        ...baseResponse,
        ...dbError,
      };
    }

    if (!(exception instanceof HttpException)) {
      return {
        ...baseResponse,
        statusCode: 500,
        errorCode: ApiErrorCode.InternalServerError,
        message: 'Internal server error',
      };
    }

    const status = exception.getStatus();

    const response = exception.getResponse() as string | HttpExceptionBody;
    const isResString = typeof response === 'string';

    // Handle ErrorResponseException directly to preserve error codes
    if (exception instanceof ErrorResponseException) {
      const errorCode: ErrorCodeType =
        !isResString && typeof response !== 'string' && response.errorCode
          ? response.errorCode
          : isResString
            ? (response as ErrorCodeType)
            : ApiErrorCode.HttpError;

      return {
        ...baseResponse,
        statusCode: exception.getStatus(),
        errorCode,
        message:
          typeof response === 'string'
            ? response
            : response?.message && typeof response.message === 'string'
              ? response.message
              : '',
        errors: typeof response === 'string' ? undefined : response?.errors,
      };
    }

    if (
      status === 400 &&
      !isResString &&
      typeof response !== 'string' &&
      'message' in response &&
      response.message
    ) {
      return this.handleValidationError(response, baseResponse);
    }

    return {
      ...baseResponse,
      statusCode: status,
      errorCode: this.HTTP_ERROR_CODES[status] || ApiErrorCode.HttpError,
      message: exception.message ?? 'Error',
    };
  }

  private handleValidationError(
    response: HttpExceptionBody,
    baseResponse: BaseErrorResponse,
  ): ErrorResponsePayload {
    const message = response.message;

    if (Array.isArray(message)) {
      return {
        ...baseResponse,
        statusCode: 400,
        errorCode: ApiErrorCode.ValidationError,
        message: 'Validation failed',
        errors: message,
      };
    }

    if (typeof message === 'string') {
      if (message.includes('JSON') || message.includes('Unexpected token')) {
        return {
          ...baseResponse,
          statusCode: 400,
          errorCode: ApiErrorCode.BadRequest,
          message: 'Invalid JSON format in request body',
        };
      }

      if (this.isValidationMessage(message)) {
        return {
          ...baseResponse,
          statusCode: 400,
          errorCode: ApiErrorCode.ValidationError,
          message: 'Validation failed',
          errors: [message],
        };
      }

      return {
        ...baseResponse,
        statusCode: 400,
        errorCode: ApiErrorCode.BadRequest,
        message,
      };
    }

    return {
      ...baseResponse,
      statusCode: 400,
      errorCode: ApiErrorCode.BadRequest,
      message: 'Bad Request',
    };
  }

  private handleDatabaseError(error: Error): DbErrorResponse {
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
}
