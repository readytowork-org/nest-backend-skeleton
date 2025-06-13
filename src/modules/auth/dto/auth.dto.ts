import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@app/modules/users/types/user.role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: '09001111101' })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone_number: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiPropertyOptional({
    example: UserRole.USER,
    enum: UserRole,
    description: 'User role - defaults to USER if not provided',
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid UserRole' })
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token received from login',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refresh_token: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Reset token received from email',
  })
  @IsString({ message: 'Reset token must be a string' })
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class VerifySignupOtpDto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'OTP code is required' })
  @IsString()
  otp: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'otp_session_id is required' })
  @IsString()
  otp_session_id: string;
}

export class ResendSignupOtpDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'otp_session_id is required' })
  @IsString()
  otp_session_id: string;
}

export class SafeUserDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  auth_provider: string;

  @ApiProperty()
  profile_picture: string | null;

  @ApiProperty({ example: UserRole.USER })
  role: UserRole;
}

export class LoginResponseDto extends SafeUserDto {
  @ApiProperty({ example: 'Success' })
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}

export class LoginResponseWithMessageDto {
  @ApiProperty({ example: 'Success' })
  message: string;
}
export class LoginResponseWithDataDto {
  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty()
  data: LoginResponseDto;
}
