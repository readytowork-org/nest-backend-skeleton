import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { SeedingService } from './modules/seed/seed.service';

async function bootstrap() {
  const bootstrapLogger = AppLogger.forRoot('NestJS-App');
  const app = await NestFactory.create(AppModule, {
    logger: bootstrapLogger,
  });
  const logger = app.get(AppLogger);

  // seeding the database
  try {
    const seedingService = app.get(SeedingService);
    await seedingService.runAllSeeds();
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Failed to run database seeding:', error.message);
    } else {
      logger.error('Failed to run database seeding:', error as string);
    }
  }

  // Enable CORS
  app.enableCors();

  // global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/',
    defaultVersion: 'v1',
  });

  if (process.env.NODE_ENV != 'production') {
    // swagger implementation
    const config = new DocumentBuilder()
      .setTitle(`${process.env.NODE_ENV} Nest App Backend`)
      .setDescription('The bare skeleton API description')
      .setVersion('1.0')
      .addTag('Healthz', 'Get the status of the server')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'BearerAuth', // This is the security scheme name
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // logging the server status
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
