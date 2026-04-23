import { Module } from '@nestjs/common';
import { StaffModule } from './staffs/staff.module';

@Module({
  imports: [StaffModule],
  controllers: [],
  providers: [],
})
export class AdminModule {}
