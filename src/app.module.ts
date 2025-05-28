import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/config/logger/logger.module';
import { AuthModule } from '@modules/auth/auth.module';
import { HealthModule } from '@modules/healthz/healthz.module';
import { UsersModule } from './modules/users/users.module';
import { TodosModule } from './modules';
import { DrizzleModule } from './db';
import { SeedingModule } from './modules/seed/seed.module';

// import the config module
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    LoggerModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TodosModule,
    SeedingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
