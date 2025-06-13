import { IsEnum, IsInt, IsString, Length } from 'class-validator';
import { OtpPurposeEnum } from '../types';
import { otpSchema } from '@app/db';

export type Otp = typeof otpSchema.$inferSelect;

export class CreateOtpDto {
  @IsInt()
  userId: number;

  @IsString()
  @Length(6, 6)
  otpCode: string;

  @IsEnum(OtpPurposeEnum)
  purpose: OtpPurposeEnum;

  @IsString()
  otpSessionId: string;

  expiresAt: Date;

  verified: boolean;
}
