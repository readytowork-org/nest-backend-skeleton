import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/config/logger/logger.module';
import { DrizzleModule } from './db';
import { validate } from 'class-validator';
import { SeedingModule } from './api/seed/seed.module';
import { AuthModule, HealthModule } from './api';

// import the config module
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => {
        return validate(config);
      },
    }),
    DrizzleModule,
    LoggerModule,
    HealthModule,
    AuthModule,
    SeedingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
