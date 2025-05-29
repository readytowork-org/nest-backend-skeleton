import { ApiErrorCode } from '@app/common';
import { HttpException, HttpStatus } from '@nestjs/common';

// error response class for API responses
export class ErrorResponse<T> {
  error_code: ApiErrorCode;
  message: string;
  error: T;
  timestamp: string;

  constructor(error_code: ApiErrorCode, field: string, error: T) {
    this.error_code = error_code;
    this.message = field;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorResponseException<T> extends HttpException {
  constructor(
    error_code: ApiErrorCode,
    message: string,
    error: T,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(new ErrorResponse<T>(error_code, message, error), statusCode);
  }
}
