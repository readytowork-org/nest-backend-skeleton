import { ApiErrorCode } from '@app/common';
import { HttpErrorType } from '@common/constants/api_status.enum';
import { HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export interface iErrorResponse {
  status: boolean;
  statusCode: HttpErrorType;
  errorCode: ApiErrorCode;
  message: string;
  errors?: string[];
}

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

export class ErrorResponseDto {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  timestamp: string;
  @ApiProperty()
  path: string;
  @ApiProperty()
  method: string;
  @ApiProperty()
  statusCode: HttpErrorType;
  @ApiProperty()
  errorCode: ApiErrorCode;
  @ApiProperty()
  message: string;
  @ApiProperty()
  errors?: string[];
}
