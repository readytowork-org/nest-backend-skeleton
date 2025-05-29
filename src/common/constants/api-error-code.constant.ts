export const ApiErrorCode = {
  Unauthorized: 'unauthorized',
  Forbidden: 'forbidden',
  NotFound: 'not_found',
  Conflict: 'conflict',
  Internal: 'internal',
  Unavailable: 'unavailable',
  TooManyRequests: 'too_many_requests',
  InvalidRequest: 'invalid_request',
  BadRequest: 'bad_request',
  InvalidCredentials: 'invalid_credentials',
  InvalidToken: 'invalid_token',
  InvalidRefreshToken: 'invalid_refresh_token',
  InvalidIP: 'invalid_ip',
  ExpiredToken: 'expired_token',
} as const;

export type ApiErrorCode = typeof ApiErrorCode[keyof typeof ApiErrorCode];