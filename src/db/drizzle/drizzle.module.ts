import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import { DrizzleService } from './drizzle.service';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DRIZZLE_CLIENT',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connection = await mysql.createConnection({
          password: configService.get<string>('DB_PASSWORD'),
          port: configService.get<number>('DB_PORT'),
          host: configService.get<string>('DB_HOST'),
          user: configService.get<string>('DB_USERNAME'),
          database: configService.get<string>('DB_NAME'),
        });
        return drizzle(connection);
      },
    },
    DrizzleService,
  ],
  exports: ['DRIZZLE_CLIENT', DrizzleService],
})
export class DrizzleModule {}
