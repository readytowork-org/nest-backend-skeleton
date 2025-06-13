/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import { hash } from 'bcrypt';
import { UserRole } from '@app/modules/users/types/user.role.enum';
import { UsersService } from '../users/users.service';
import { envVars } from '@app/config/env/env.validation';
import { SALT_ROUNDS } from '@app/common';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(private readonly userService: UsersService) {}

  async seedAdmin(): Promise<void> {
    try {
      const systemEmail = envVars.SYSTEM_EMAIL;
      const systemPassword = envVars.SYSTEM_PASSWORD;
      if (!systemEmail || !systemPassword) {
        this.logger.warn(
          'SYSTEM_EMAIL or SYSTEM_PASSWORD not provided. Skipping admin seeding.',
        );
        return;
      }
      const user = await this.userService.findUnique(systemEmail);
      if (user) {
        this.logger.log(
          `Admin user with email ${systemEmail} already exists. Skipping seeding.`,
        );
        return;
      }
      const hashedPassword = await hash(systemPassword, SALT_ROUNDS);
      await this.userService.create({
        email: systemEmail,
        password: hashedPassword,
        name: 'System Administrator',
        authProvider: 'local',
        profilePicture: null,
        role: UserRole.ADMIN,
      });
      this.logger.log(
        `✅ Admin user created successfully with email: ${systemEmail}`,
      );
    } catch (error) {
      this.logger.error('Failed to seed admin user:', error);
      throw error;
    }
  }

  async runAllSeeds(): Promise<void> {
    this.logger.log('🌱🌱🌱🌱🌱 Starting database seeding...');
    try {
      await this.seedAdmin();
      this.logger.log('✅ Database seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}
