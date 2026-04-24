import { DrizzleModule } from '@app/config';
import { TransactionInterceptor } from '@app/config/interceptors/transaction.interceptor';
import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffRepository } from '@app/api/admin/staffs/staff.repository';
import { StaffController } from './staff.controller';
import { PaginationModule } from '@app/services/pagination/pagination.module';

@Module({
  imports: [DrizzleModule, PaginationModule],
  providers: [TransactionInterceptor, StaffService, StaffRepository],
  exports: [StaffService],
  controllers: [StaffController],
})
export class StaffModule {}
