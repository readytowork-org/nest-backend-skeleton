import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envVars } from '@app/config/env/env.validation';
import { JwtStrategy } from '@app/services/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '@app/services/auth/guards/jwt-auth.guard';
import { GoogleStrategy } from '@app/services/auth/strategies/google.strategy';
import { DrizzleModule } from '@app/config/orm/drizzle/drizzle.module';
import { PaginationModule } from '@app/services/pagination/pagination.module';
import { StorageModule } from '@app/services/storage/storage.module';
import { AdminModule } from '../admin/admin.module.';
import { StaffModule } from '../admin/staffs/staff.module';
import { StaffRepository } from '../admin/staffs/staff.repository';

@Module({
  imports: [
    PaginationModule,
    DrizzleModule,
    StorageModule,
    StaffModule,
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
    JwtAuthGuard,
    GoogleStrategy,
    StaffRepository,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
