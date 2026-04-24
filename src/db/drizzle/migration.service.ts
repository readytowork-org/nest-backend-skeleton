// migration.service.ts
// eslint-disable-next-line prettier/prettier
import { Injectable, Logger } from '@nestjs/common';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { DrizzleService } from './drizzle.service';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  async runMigrations() {
    await migrate(this.drizzleService.db, {
      migrationsFolder: './src/db/migrations',
    });
    this.logger.log('✅ Migrations completed successfully');
  }
}
