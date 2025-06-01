import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleModule } from '@app/db';
import { UserRepository } from './users.repository';

@Module({
  imports: [DrizzleModule],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
