import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AfterSignupEvent } from '../types/after-signup-event';
import { OtpService } from '../otp.service';
import { OtpPurposeEnum } from '../types';
import { SmsService } from '@app/services/sms/sms.service';
import { generateOtpAndHash } from '@app/utils';
import { envVars } from '@app/config/env/env.validation';

@Injectable()
export class OtpListener {
  private readonly logger = new Logger(OtpListener.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly SmsService: SmsService,
  ) {}

  @OnEvent('otp.after_signup')
  async handleOtpAfterSignup(event: AfterSignupEvent) {
    try {
      const expiryMinutes = envVars.SMS_OTP_EXPIRY_MINUTES;
      if (!expiryMinutes) {
        throw new Error(
          'SMS_OTP_EXPIRY_MINUTES is not defined in the environment variables',
        );
      }
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      const { otp, hashedOtp } = generateOtpAndHash(6);

      await this.otpService.create({
        otpSessionId: event.otpSessionId,
        userId: event.userId,
        otpCode: hashedOtp,
        purpose: OtpPurposeEnum.REGISTER,
        expiresAt: expiresAt,
        verified: false,
      });

      const text = `Your verification code is ${otp}. It will expire in ${expiryMinutes} minutes.`;

      await this.SmsService.sendSms(
        event.phoneNumber,
        text,
        String(event.userId),
      );
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(err, err?.stack);
      throw error;
    }
  }
}
