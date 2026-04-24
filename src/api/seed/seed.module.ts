import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeedingService } from './seed.service';
import { StaffModule } from '../admin/staffs/staff.module';

@Module({
  imports: [ConfigModule, StaffModule],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
