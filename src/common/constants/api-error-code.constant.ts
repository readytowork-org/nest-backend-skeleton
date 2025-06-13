export const ApiErrorCode = {
  // Authentication & Authorization
  Unauthorized: 'unauthorized',
  Forbidden: 'forbidden',
  InvalidCredentials: 'invalid_credentials',
  InvalidToken: 'invalid_token',
  InvalidRefreshToken: 'invalid_refresh_token',
  ExpiredToken: 'expired_token',

  // General HTTP Errors
  BadRequest: 'bad_request',
  NotFound: 'not_found',
  Conflict: 'conflict',
  TooManyRequests: 'too_many_requests',
  InvalidRequest: 'invalid_request',

  // Database Error Codes
  DatabaseError: 'database_error',
  DuplicateEntry: 'duplicate_entry',

  // Validation Error Codes
  ValidationError: 'validation_error',

  // Network & Service Errors
  NetworkError: 'network_error',
  ServiceUnavailable: 'service_unavailable',
  ConnectionRefused: 'connection_refused',
  Timeout: 'timeout',
  Unavailable: 'unavailable',

  // System Errors
  InternalServerError: 'internal_server_error',

  HttpError: 'http_error',
  UnhandledError: 'unhandled_error',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
