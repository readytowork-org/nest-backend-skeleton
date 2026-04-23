import { Injectable, Logger } from '@nestjs/common';
import { envVars } from '@app/config/env/env.validation';
import { StaffService } from '@app/api/admin/staffs/staff.service';
import { CreateStaffDto, USER_ROLE } from '@app/common/types';


@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    private readonly staffService: StaffService,
  ) {}

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
      const existingAdmin = await this.staffService.findByEmail(systemEmail);
      if (!existingAdmin) {
        this.logger.log(`Seeding admin with email: ${systemEmail}`);
        const createdId = await this.staffService.create(USER_ROLE.ADMIN, {
          email: systemEmail,
          password: systemPassword,
          name: 'System Admin',
          isActive: 1,
        } as CreateStaffDto);
        if (!createdId) {
          this.logger.error('Failed to seed admin user');
        }
      }
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
