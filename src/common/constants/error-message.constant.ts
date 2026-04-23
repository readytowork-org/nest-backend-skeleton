export const ErrorMessages = {
  // User Management Messages
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PHONE_NUMBER_ALREADY_EXISTS: 'Phone number already exists',
  EMAIL_OR_PHONE_NUMBER_ALREADY_EXISTS: 'Email or Phone number already exists',
  EMAIL_NOT_FOUND: 'No user found with this email address',
  INVALID_USER_DATA: 'Invalid user data provided',

  STAFF_NOT_FOUND: 'Staff member not found',
  INVALID_STAFF_ID: 'Invalid staff ID provided',
  FAILED_TO_UPDATE_STAFF: 'Failed to update staff',

  // Authentication & Authorization Messages
  UNAUTHORIZED: 'You are not authorized to access this resource',
  FORBIDDEN: 'You do not have permission to access this resource',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_TOKEN: 'Invalid or malformed token',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  EXPIRED_TOKEN: 'Token has expired',
  TOKEN_MISSING: 'Authentication token is required',
  SESSION_EXPIRED: 'Your session has expired, please login again',
  AUTHENTICATION_FAILED: 'Authentication failed',
  LOGIN_REQUIRED: 'Please login to access this resource',
  INVALID_X_REQUESTED_WITH_HEADER:
    'please provide valid x-requested-with header',
  ACCOUNT_SUSPENDED: 'Account suspended, please contact with administration',


  // Password Management Messages
  INVALID_PASSWORD: 'Password does not meet requirements',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
  PASSWORD_RESET_SENT: 'Password reset email has been sent',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  INVALID_RESET_TOKEN: 'Invalid or expired reset token',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  SAME_OLD_PASSWORD_NEW_PASSWORD:
    'Your new password is same as your old password.',

  // General HTTP Error Messages
  BAD_REQUEST: 'Invalid request parameters',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exists',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  INVALID_REQUEST: 'Invalid request format',
  METHOD_NOT_ALLOWED: 'HTTP method not allowed',
  UNSUPPORTED_MEDIA_TYPE: 'Unsupported media type',

  // Resource Specific Messages
  RESOURCE_NOT_FOUND: 'Requested resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',
  RESOURCE_CREATED_SUCCESSFULLY: 'Resource created successfully',
  RESOURCE_UPDATED_SUCCESSFULLY: 'Resource updated successfully',
  RESOURCE_DELETED_SUCCESSFULLY: 'Resource deleted successfully',

  // Database Error Messages
  DATABASE_ERROR: 'Database operation failed',
  DUPLICATE_ENTRY: 'Record already exists',
  FOREIGN_KEY_CONSTRAINT: 'Referenced record not found',
  DATABASE_CONNECTION_ERROR: 'Unable to connect to database',
  RECORD_NOT_FOUND: 'Record not found in database',
  RECORD_CREATION_FAILED: 'Failed to create record',
  RECORD_UPDATE_FAILED: 'Failed to update record',
  RECORD_DELETE_FAILED: 'Failed to delete record',

  // Validation Error Messages
  VALIDATION_ERROR: 'Validation failed',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  INVALID_FORMAT: 'Invalid format provided',
  FIELD_TOO_LONG: 'Field exceeds maximum length',
  FIELD_TOO_SHORT: 'Field does not meet minimum length',
  INVALID_DATE_FORMAT: 'Invalid date format',
  INVALID_PHONE_NUMBER: 'Invalid phone number format',

  // OAuth & Social Authentication Messages
  OAUTH_ERROR: 'OAuth authentication error',
  SOCIAL_AUTH_FAILED: 'Social authentication failed',
  PROVIDER_ERROR: 'Authentication provider error',
  EMAIL_MISSING_IN_AUTH: 'Email missing in authentication data',
  INVALID_AUTH_PROVIDER: 'Please use the appropriate authentication method',

  // Success Messages
  SUCCESS: 'Operation completed successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration completed successfully',
  EMAIL_SENT_SUCCESS: 'Email sent successfully',
  DATA_RETRIEVED_SUCCESS: 'Data retrieved successfully',
  OPERATION_SUCCESS: 'Operation completed successfully',

  // Business Logic Error Messages
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
  OPERATION_NOT_ALLOWED: 'This operation is not allowed',
  INVALID_OPERATION: 'Invalid operation attempted',
  BUSINESS_RULE_VIOLATION: 'Operation violates business rules',
  QUOTA_EXCEEDED: 'Quota limit exceeded',
  FEATURE_DISABLED: 'This feature is currently disabled',

  // System Error Messages
  INTERNAL_SERVER_ERROR: 'Internal server error occurred',
  CONFIGURATION_ERROR: 'System configuration error',
  FEATURE_NOT_AVAILABLE: 'Feature not available',
  MAINTENANCE_MODE: 'System is under maintenance',
  VERSION_MISMATCH: 'API version mismatch',

  // Generic Messages
  SOMETHING_WENT_WRONG: 'Something went wrong, please try again',
  PLEASE_TRY_AGAIN: 'Please try again later',

  // OTP message
  OTP_NOT_VERIFIED: 'OTP not verfied',
};
