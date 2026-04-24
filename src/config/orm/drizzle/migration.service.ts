// migration.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { DRIZZLE_CLIENT } from '@config/orm/drizzle/drizzle-client.constant';
import { DBClientObj } from '@config/orm/drizzle/db.client';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly drizzleClient: DBClientObj,
  ) {}

  async runMigrations() {
    await migrate(this.drizzleClient, {
      migrationsFolder: './src/db/migrations',
    });
    this.logger.log('✅ Migrations completed successfully');
  }
}
