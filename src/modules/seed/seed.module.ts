import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@app/db';
import { SeedingService } from './seed.service';

@Module({
  imports: [DrizzleModule, ConfigModule],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
