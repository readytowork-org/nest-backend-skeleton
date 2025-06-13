import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import { DrizzleService } from './drizzle.service';
import { ConfigModule } from '@nestjs/config';
import { DRIZZLE_CLIENT } from '@app/common';
import { MigrationService } from './migration.service';
import { envVars } from '@app/config/env/env.validation';

@Module({
  imports: [ConfigModule],
  /** database provider 
      -> objects to instance once in application and can used into other modules at runtime. **/
  providers: [
    {
      provide: DRIZZLE_CLIENT,
      inject: [],
      useFactory: () => {
        const poolConnection = mysql.createPool({
          //concurrent connection with diff users
          user: envVars.DB_USERNAME,
          password: envVars.DB_PASSWORD,
          database: envVars.DB_NAME,
          port: envVars.DB_PORT,
          // if not local then use socket for unix socket
          ...(envVars.ENVIRONMENT != 'local'
            ? {
                socketPath: `/cloudsql/${envVars.DB_HOST}`,
              }
            : {
                //if local then use socket path
                host: envVars.DB_HOST,
              }),
          timezone: envVars.TZ,
        });
        return drizzle({ client: poolConnection });
      },
    },
    DrizzleService,
    MigrationService,
  ],
  exports: [DRIZZLE_CLIENT, DrizzleService],
})
export class DrizzleModule {}
