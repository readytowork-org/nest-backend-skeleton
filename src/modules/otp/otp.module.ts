import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { DrizzleModule } from '@app/db';
import { OtpRepository } from './otp.repository';
import { SmsModule } from '@app/services/sms/sms.module';
import { OtpListener } from './listeners/otp.listener';

@Module({
  imports: [DrizzleModule, SmsModule],
  providers: [OtpService, OtpRepository, OtpListener],
  exports: [OtpService, OtpRepository],
})
export class OtpModule {}
