import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@app/db';
import { SeedingService } from './seed.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, ConfigModule],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
