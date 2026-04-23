import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import { ConfigModule } from '@nestjs/config';
import { MigrationService } from './migration.service';
import { envVars } from '@config/env/env.validation';
import { DrizzleService } from './drizzle.service';
import { DRIZZLE_CLIENT } from './drizzle-client.constant';
import { OrmService } from '@config/orm/orm.interface';
import { EnhancedQueryLogger } from 'drizzle-query-logger';
import { AppLogger } from '@app/config';
import * as schema from '@app/db/schemas';
import { DBClientObj } from './db.client';

@Module({
  imports: [ConfigModule],
  /** database provider
      -> objects to instance once in application and can used into other modules at runtime. **/
  providers: [
    {
      provide: DRIZZLE_CLIENT,
      inject: [AppLogger],
      useFactory: (appLogger: AppLogger) => {
        const poolConnection = mysql.createPool({
          //concurrent connection with diff users
          user: envVars.DB_USERNAME,
          password: envVars.DB_PASSWORD,
          database: envVars.DB_NAME,
          port: envVars.DB_PORT,
          ...(envVars.ENVIRONMENT == 'production'
            ? {
                socketPath: `/cloudsql/${envVars.DB_HOST}`,
              }
            : {
                //if local then use socket path
                host: envVars.DB_HOST,
              }),
          timezone: envVars.TZ,
        });

        const db = drizzle(poolConnection, {
          logger:
            envVars.ENVIRONMENT != 'production'
              ? new EnhancedQueryLogger({
                  log: (message: any) => {
                    appLogger.log(message, 'Drizzle');
                  },
                })
              : false,
          schema: { ...schema },
          mode: 'default',
        });

        const dbClientObj = Object.create(DBClientObj.prototype) as object;
        Object.assign(dbClientObj, db);

        return dbClientObj;
      },
    },
    DrizzleService,
    { provide: OrmService, useClass: DrizzleService },
    MigrationService,
  ],
  exports: [DRIZZLE_CLIENT, OrmService, DrizzleService],
})
export class DrizzleModule {}
