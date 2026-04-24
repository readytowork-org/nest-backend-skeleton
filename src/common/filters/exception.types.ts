import { ApiErrorCode } from '@app/common';

export interface BaseErrorResponse {
  success: boolean;
  timestamp: string;
  path: string;
  method: string;
}

// Allow custom error codes that might not be in ApiErrorCode (e.g., from ErrorResponseException)
export type ErrorCodeType = ApiErrorCode;

export interface ErrorResponsePayload extends BaseErrorResponse {
  statusCode: number;
  errorCode: ErrorCodeType;
  message: string;
  errors?: unknown;
}

export interface HttpExceptionBody {
  message?: string | string[];
  errorCode?: ErrorCodeType;
  errors?: unknown;
  [key: string]: unknown;
}

export interface DbErrorResponse {
  statusCode: number;
  errorCode: ApiErrorCode;
  message: string;
}

export type DbErrorPatternMap = {
  readonly duplicate: {
    readonly patterns: readonly string[];
    readonly response: DbErrorResponse;
  };
  readonly foreignKey: {
    readonly patterns: readonly string[];
    readonly response: DbErrorResponse;
  };
  readonly referenced: {
    readonly patterns: readonly string[];
    readonly response: DbErrorResponse;
  };
  readonly connection: {
    readonly patterns: readonly string[];
    readonly response: DbErrorResponse;
  };
};
