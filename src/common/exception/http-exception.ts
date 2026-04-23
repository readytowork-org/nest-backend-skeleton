import { ApiErrorCode } from '@app/common/constants/api-error-code.constant';
import { HttpErrorType } from '@app/common/constants/api_status.enum';
import { ErrorMessages } from '@app/common/constants/error-message.constant';
import { ErrorResponseException } from '@app/common/api_response/error_response';

// Base HTTP Exceptions
export class BadRequestException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.BAD_REQUEST, errors?: string[]) {
    super(ApiErrorCode.BadRequest, message, HttpErrorType.BadRequest, errors);
  }
}

export class UnauthorizedException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.UNAUTHORIZED) {
    super(ApiErrorCode.Unauthorized, message, HttpErrorType.Unauthorized);
  }
}

export class ForbiddenException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.FORBIDDEN) {
    super(ApiErrorCode.Forbidden, message, HttpErrorType.Forbidden);
  }
}

export class NotFoundException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.NOT_FOUND) {
    super(ApiErrorCode.NotFound, message, HttpErrorType.NotFound);
  }
}

export class ConflictException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.CONFLICT) {
    super(ApiErrorCode.Conflict, message, HttpErrorType.Conflict);
  }
}

export class TooManyRequestsException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.TOO_MANY_REQUESTS) {
    super(ApiErrorCode.TooManyRequests, message, HttpErrorType.TooManyRequests);
  }
}

export class InternalServerErrorException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.INTERNAL_SERVER_ERROR) {
    super(
      ApiErrorCode.InternalServerError,
      message,
      HttpErrorType.InternalError,
    );
  }
}

// Authentication specific exceptions
export class InvalidCredentialsException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.INVALID_CREDENTIALS) {
    super(ApiErrorCode.InvalidCredentials, message, HttpErrorType.Unauthorized);
  }
}

export class InvalidTokenException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.INVALID_TOKEN) {
    super(ApiErrorCode.InvalidToken, message, HttpErrorType.Unauthorized);
  }
}

export class ExpiredTokenException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.EXPIRED_TOKEN) {
    super(ApiErrorCode.ExpiredToken, message, HttpErrorType.Unauthorized);
  }
}

export class InvalidRefreshTokenException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.INVALID_REFRESH_TOKEN) {
    super(
      ApiErrorCode.InvalidRefreshToken,
      message,
      HttpErrorType.Unauthorized,
    );
  }
}

export class AccountSuspendedException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.ACCOUNT_SUSPENDED) {
    super(ApiErrorCode.AccountSuspended, message, HttpErrorType.Unauthorized);
  }
}

// User specific exceptions
export class UserNotFoundException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.USER_NOT_FOUND) {
    super(ApiErrorCode.NotFound, message, HttpErrorType.NotFound);
  }
}

export class UserAlreadyExistsException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.USER_ALREADY_EXISTS) {
    super(ApiErrorCode.Conflict, message, HttpErrorType.Conflict);
  }
}

export class EmailAlreadyExistsException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.EMAIL_ALREADY_EXISTS) {
    super(ApiErrorCode.Conflict, message, HttpErrorType.Conflict);
  }
}

export class PhoneAlreadyExistsException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.PHONE_NUMBER_ALREADY_EXISTS) {
    super(ApiErrorCode.Conflict, message, HttpErrorType.Conflict);
  }
}

// Database specific exceptions
export class DuplicateEntryException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.DUPLICATE_ENTRY) {
    super(ApiErrorCode.DuplicateEntry, message, HttpErrorType.Conflict);
  }
}

export class RecordExistsException extends ErrorResponseException {
  constructor(
    message: string = ErrorMessages.DUPLICATE_ENTRY,
    errors?: string[],
  ) {
    super(
      ApiErrorCode.DuplicateEntry,
      message,
      HttpErrorType.BadRequest,
      errors,
    );
  }
}

export class DatabaseException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.DATABASE_ERROR) {
    super(ApiErrorCode.DatabaseError, message, HttpErrorType.InternalError);
  }
}

// Validation exception
export class ValidationException extends ErrorResponseException {
  constructor(
    message: string = ErrorMessages.VALIDATION_ERROR,
    errors?: string[],
  ) {
    super(
      ApiErrorCode.ValidationError,
      message,
      HttpErrorType.BadRequest,
      errors,
    );
  }
}

// Resource specific exceptions
export class ResourceNotFoundException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.RESOURCE_NOT_FOUND) {
    super(ApiErrorCode.NotFound, message, HttpErrorType.NotFound);
  }
}

export class ResourceAlreadyExistsException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.RESOURCE_ALREADY_EXISTS) {
    super(ApiErrorCode.Conflict, message, HttpErrorType.Conflict);
  }
}

// Business logic exceptions
export class InsufficientPermissionsException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.INSUFFICIENT_PERMISSIONS) {
    super(ApiErrorCode.Forbidden, message, HttpErrorType.Forbidden);
  }
}

export class OperationNotAllowedException extends ErrorResponseException {
  constructor(message: string = ErrorMessages.OPERATION_NOT_ALLOWED) {
    super(ApiErrorCode.BadRequest, message, HttpErrorType.BadRequest);
  }
}

export class OtpVerificationRequiredException extends ErrorResponseException {
  constructor(public readonly data: Record<string, any>) {
    super(
      ApiErrorCode.OtpVerificationRequired,
      ErrorMessages.OTP_NOT_VERIFIED,
      HttpErrorType.Forbidden,
    );
  }

  override getResponse(): Record<string, any> {
    const baseResponse = super.getResponse() as Record<string, any>;
    return {
      ...baseResponse,
      data: this.data,
    };
  }
}
