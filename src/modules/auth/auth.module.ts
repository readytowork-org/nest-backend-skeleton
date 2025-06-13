import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AmazonStrategy } from './strategies/amazon.strategy';
import { LineAuthStrategy } from './strategies/line.strategy';
import { RolesGuard } from './guards/roles.guard';
import { OtpModule } from '../otp/otp.module';
import { envVars } from '@app/config/env/env.validation';
import { EmailService } from '@app/services/email/email.service';
// import { EmailService } from '@app/services/email/email.service';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        secret: envVars.JWT_ACCESS_SECRET,
        signOptions: {
          expiresIn: envVars.JWT_ACCESS_EXPIRES_IN || '1h',
        },
      }),
    }),
    OtpModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    AmazonStrategy,
    LineAuthStrategy,
    RolesGuard,
    EmailService,
    // AuthRolesGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
