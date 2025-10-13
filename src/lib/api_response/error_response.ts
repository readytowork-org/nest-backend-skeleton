import { ApiErrorCode } from '@app/common';
import { HttpErrorType } from '@app/common/constants/api_status.enum';
import { HttpException } from '@nestjs/common';

export class ErrorResponse {
  success: boolean;
  statusCode: HttpErrorType;
  errorCode: ApiErrorCode;
  message: string;
  errors?: string[];

  constructor(
    errorCode: ApiErrorCode,
    message: string,
    statusCode: HttpErrorType = HttpErrorType.BadRequest,
    errors?: string[],
  ) {
    this.success = false;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.message = message;
    if (errors && errors.length > 0) {
      this.errors = errors;
    }
  }
}

export class ErrorResponseException extends HttpException {
  constructor(
    errorCode: ApiErrorCode,
    message: string,
    statusCode: HttpErrorType = HttpErrorType.BadRequest,
    errors?: string[],
  ) {
    super(
      new ErrorResponse(errorCode, message, statusCode, errors),
      statusCode,
    );
  }
}
