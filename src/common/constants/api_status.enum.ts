export enum HttpErrorType {
  BadRequest = 400,
  StatusOk = 200,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  InternalError = 500,
  Unavailable = 503,
  TooManyRequests = 429,
  Redirect = 302,
}
