import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppLogger } from './config/logger/app-logger.service';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  VersioningType,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './lib/filters/global-exception.filter';
import { Reflector } from '@nestjs/core';
import { SeedingService } from './modules/seed/seed.service';
import { envVars } from './config/env/env.validation';
import { MigrationService } from './db/drizzle/migration.service';

async function bootstrap() {
  const bootstrapLogger = AppLogger.forRoot('NestJS-App');
  const app = await NestFactory.create(AppModule, {
    logger: bootstrapLogger,
  });

  const reflector = app.get(Reflector);
  const logger = app.get(AppLogger);

  app.enableCors();
  // Run migrations and seeding
  const migrationService = app.get(MigrationService);
  await migrationService.runMigrations();
  const seedingService = app.get(SeedingService);
  await seedingService.runAllSeeds();

  // Global exception filter for consistent error handling
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Global interceptor for response serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/',
    defaultVersion: 'v1',
  });

  // Swagger (only in non-production)
  if (envVars.ENVIRONMENT !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(`${envVars.ENVIRONMENT} Nest App Backend`)
      .setDescription('The bare skeleton API description')
      .setVersion('1.0')
      .addTag('Healthz', 'Get the status of the server')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
          name: 'Authorization',
          description: 'Enter your JWT access token',
        },
        'BearerAuth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  if (envVars.ENVIRONMENT !== 'production') {
    logger.log(`Swagger available at: http://localhost:${port}/api`);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
