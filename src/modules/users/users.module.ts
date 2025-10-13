import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleModule, UserRepository } from '@app/db';
import { PaginationModule } from '@app/services/pagination/pagination.module';

@Module({
  imports: [DrizzleModule, PaginationModule],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
