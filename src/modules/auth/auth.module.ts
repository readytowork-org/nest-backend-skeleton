import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { RolesGuard } from './guards/roles.guard';
import { EmailService } from '../../services/email/email.service';
import { envVars } from '@app/config/env/env.validation';
import { DrizzleModule } from '@app/db';

@Module({
  imports: [
    DrizzleModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () =>
        ({
          secret: envVars.JWT_ACCESS_SECRET,
          signOptions: {
            expiresIn: envVars.JWT_ACCESS_EXPIRES_IN || '1h',
          },
        }) as JwtModuleOptions,
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    RolesGuard,
    EmailService,
    // AuthRolesGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
