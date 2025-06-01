
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { UserRole } from '@app/modules/users/types/user.role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async seedAdmin(): Promise<void> {
    try {
      const systemEmail = this.configService.get<string>('SYSTEM_EMAIL');
      const systemPassword = this.configService.get<string>('SYSTEM_PASSWORD');
      if (!systemEmail || !systemPassword) {
        this.logger.warn('SYSTEM_EMAIL or SYSTEM_PASSWORD not provided. Skipping admin seeding.');
        return;
      }
      const user = await this.userService.findUnique(systemEmail)
      if (user) {
        this.logger.log(`Admin user with email ${systemEmail} already exists. Skipping seeding.`);
        return;
      }
      // Hash the password
      const hashedPassword = await hash(systemPassword, 10);
      this.userService.create({
         email: systemEmail,
         password: hashedPassword,
          name: 'System Administrator',
          authProvider: 'local',
          profilePicture: null,
          role: UserRole.ADMIN,
      })
      this.logger.log(`✅ Admin user created successfully with email: ${systemEmail}`);
    } catch (error) {
      this.logger.error('Failed to seed admin user:', error);
      throw error;
    }
  }

  async runAllSeeds(): Promise<void> {
    this.logger.log('🌱 Starting database seeding...');
    try {
      await this.seedAdmin();
      this.logger.log('✅ Database seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}
