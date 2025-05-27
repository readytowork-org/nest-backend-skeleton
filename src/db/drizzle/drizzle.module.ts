import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import { DrizzleService } from './drizzle.service';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { DRIZZLE_CLIENT } from '@app/common';

@Module({
  imports: [ConfigModule],
  /** database provider 
      -> objects to instance once in application and can used into other modules at runtime. **/
  providers: [
    {
      provide: DRIZZLE_CLIENT,
      inject: [ConfigService], //excess with nestJS config
      useFactory: (configService: ConfigService) => {
        const poolConnection = mysql.createPool({
          //concurrent connection with diff users
          password: configService.get<string>('DB_PASSWORD'),
          port: configService.get<number>('DB_PORT'),
          host: configService.get<string>('DB_HOST'),
          user: configService.get<string>('DB_USERNAME'),
          database: configService.get<string>('DB_NAME'),
        });
        return drizzle({ client: poolConnection });
      },
    },
    DrizzleService,
  ],
  exports: [DRIZZLE_CLIENT, DrizzleService],
})
export class DrizzleModule {}
